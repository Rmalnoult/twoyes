import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { DATA_DIR, ensureDirs } from './utils';

const SSA_URL = 'https://www.ssa.gov/oact/babynames/names.zip';
const INSEE_URL = 'https://www.insee.fr/fr/statistiques/fichier/2540004/nat2021_csv.zip';

// ONS data URLs - England and Wales baby names
const ONS_BOYS_URL = 'https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesenglandandwalesbabynamesstatisticsboys/2022/boynames2022.csv';
const ONS_GIRLS_URL = 'https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesenglandandwalesbabynamesstatisticsgirls/2022/girlnames2022.csv';

// Germany - Cologne Open Data
const COLOGNE_2019_2022_URL = 'https://offenedaten-koeln.de/sites/default/files/Gesamt_Vornamen_2019-2022_0.csv';
const COLOGNE_2023_URL = 'https://offenedaten-koeln.de/sites/default/files/Vornamenstatistik_2023.csv';

// Spain - INE
const INE_NOMBRES_FECHA_URL = 'https://www.ine.es/en/daco/daco42/nombyapel/nombres_por_fecha_en.xls';
const INE_NOMBRES_FRECUENTES_URL = 'https://www.ine.es/daco/daco42/nombyapel/nombres_mas_frecuentes.xls';

// Italy - ISTAT (GitHub mirror of administrative data)
const ISTAT_NAMES_URL = 'https://raw.githubusercontent.com/mrblasco/genderNamesITA/master/gender_firstnames_ITA.csv';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function downloadFile(url: string, dest: string, label: string) {
  if (fs.existsSync(dest)) {
    // Verify it's not an HTML error page
    const head = fs.readFileSync(dest, { encoding: 'utf-8', flag: 'r' }).slice(0, 100);
    if (head.includes('<HTML') || head.includes('<!DOCTYPE') || head.includes('Access Denied')) {
      console.log(`  Previous download was invalid HTML, re-downloading...`);
      fs.unlinkSync(dest);
    } else {
      console.log(`  Already exists: ${path.basename(dest)}, skipping download`);
      return;
    }
  }

  console.log(`  Downloading ${label}...`);
  try {
    execSync(
      `curl -L --max-time 120 -H "User-Agent: ${USER_AGENT}" -H "Accept: */*" -o "${dest}" "${url}"`,
      { stdio: 'pipe' }
    );
    const stats = fs.statSync(dest);
    console.log(`  Downloaded: ${path.basename(dest)} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);

    // Validate not HTML error
    const head = fs.readFileSync(dest, { encoding: 'utf-8', flag: 'r' }).slice(0, 200);
    if (head.includes('<HTML') || head.includes('Access Denied')) {
      console.error(`  ERROR: Downloaded file is an HTML error page, not the expected data.`);
      console.error(`  The source may require manual download. URL: ${url}`);
      console.error(`  Please download manually and place at: ${dest}`);
      fs.unlinkSync(dest);
      throw new Error(`Download returned HTML error page for ${label}`);
    }
  } catch (error: any) {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    throw error;
  }
}

function unzip(zipPath: string, destDir: string) {
  if (!fs.existsSync(zipPath)) {
    throw new Error(`ZIP file not found: ${zipPath}`);
  }
  console.log(`  Extracting ${path.basename(zipPath)}...`);
  execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'pipe' });
}

export async function downloadSources() {
  ensureDirs();

  console.log('\n=== Downloading Data Sources ===\n');

  let hasErrors = false;

  // 1. US SSA Data
  console.log('1. US SSA Baby Names:');
  const ssaZip = path.join(DATA_DIR, 'names.zip');
  const ssaDir = path.join(DATA_DIR, 'ssa');
  try {
    await downloadFile(SSA_URL, ssaZip, 'SSA names.zip');
    if (fs.existsSync(ssaZip)) {
      if (!fs.existsSync(ssaDir) || fs.readdirSync(ssaDir).filter(f => f.startsWith('yob')).length === 0) {
        fs.mkdirSync(ssaDir, { recursive: true });
        unzip(ssaZip, ssaDir);
        const yobFiles = fs.readdirSync(ssaDir).filter(f => f.startsWith('yob'));
        console.log(`  Extracted ${yobFiles.length} year files`);
      } else {
        console.log('  Already extracted');
      }
    }
  } catch (error: any) {
    console.error(`  SKIPPED: ${error.message}`);
    console.log('  Manual download: https://www.ssa.gov/oact/babynames/names.zip');
    console.log(`  Place at: ${ssaZip}\n`);
    hasErrors = true;
  }

  // 2. France INSEE Data
  console.log('\n2. France INSEE Prenoms:');
  const inseeZip = path.join(DATA_DIR, 'nat2021_csv.zip');
  const inseeDir = path.join(DATA_DIR, 'insee');
  try {
    await downloadFile(INSEE_URL, inseeZip, 'INSEE prenoms');
    if (fs.existsSync(inseeZip)) {
      if (!fs.existsSync(inseeDir) || fs.readdirSync(inseeDir).length === 0) {
        fs.mkdirSync(inseeDir, { recursive: true });
        unzip(inseeZip, inseeDir);
        console.log(`  Extracted INSEE data`);
      } else {
        console.log('  Already extracted');
      }
    }
  } catch (error: any) {
    console.error(`  SKIPPED: ${error.message}`);
    console.log('  Manual download: https://www.insee.fr/fr/statistiques/2540004');
    console.log(`  Place at: ${inseeZip}\n`);
    hasErrors = true;
  }

  // 3. UK ONS Data
  console.log('\n3. UK ONS Baby Names:');
  const onsBoys = path.join(DATA_DIR, 'ons-boys-2022.csv');
  const onsGirls = path.join(DATA_DIR, 'ons-girls-2022.csv');
  try {
    await downloadFile(ONS_BOYS_URL, onsBoys, 'ONS boys names');
  } catch (error: any) {
    console.error(`  SKIPPED boys: ${error.message}`);
    hasErrors = true;
  }
  try {
    await downloadFile(ONS_GIRLS_URL, onsGirls, 'ONS girls names');
  } catch (error: any) {
    console.error(`  SKIPPED girls: ${error.message}`);
    hasErrors = true;
  }

  // 4. Germany Cologne Data
  console.log('\n4. Germany Cologne Baby Names:');
  const cologne2019 = path.join(DATA_DIR, 'vornamen_koeln_2019_2022.csv');
  const cologne2023 = path.join(DATA_DIR, 'vornamen_koeln_2023.csv');
  try {
    await downloadFile(COLOGNE_2019_2022_URL, cologne2019, 'Cologne 2019-2022');
  } catch (error: any) {
    console.error(`  SKIPPED 2019-2022: ${error.message}`);
    hasErrors = true;
  }
  try {
    await downloadFile(COLOGNE_2023_URL, cologne2023, 'Cologne 2023');
  } catch (error: any) {
    console.error(`  SKIPPED 2023: ${error.message}`);
    hasErrors = true;
  }

  // 5. Spain INE Data
  console.log('\n5. Spain INE Baby Names:');
  const ineFecha = path.join(DATA_DIR, 'ine_nombres_por_fecha.xls');
  const ineFrecuentes = path.join(DATA_DIR, 'ine_nombres_frecuentes.xls');
  try {
    await downloadFile(INE_NOMBRES_FECHA_URL, ineFecha, 'INE nombres por fecha');
  } catch (error: any) {
    console.error(`  SKIPPED nombres_por_fecha: ${error.message}`);
    hasErrors = true;
  }
  try {
    await downloadFile(INE_NOMBRES_FRECUENTES_URL, ineFrecuentes, 'INE nombres frecuentes');
  } catch (error: any) {
    console.error(`  SKIPPED nombres_frecuentes: ${error.message}`);
    hasErrors = true;
  }

  // 6. Italy ISTAT Data
  console.log('\n6. Italy ISTAT Baby Names:');
  const istatNames = path.join(DATA_DIR, 'istat_nomi.csv');
  try {
    await downloadFile(ISTAT_NAMES_URL, istatNames, 'ISTAT names');
  } catch (error: any) {
    console.error(`  SKIPPED: ${error.message}`);
    console.log('  Manual download from: https://github.com/mrblasco/genderNamesITA');
    hasErrors = true;
  }

  if (hasErrors) {
    console.log('\n========================================');
    console.log('  Some downloads failed.');
    console.log('  Please download manually and re-run.');
    console.log('  Expected files in: scripts/seed/data/');
    console.log('========================================\n');
  } else {
    console.log('\nAll downloads complete!\n');
  }
}
