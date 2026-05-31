const https = require('https');
https.get('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/C6H12O6/PNG', (res) => {
  console.log('fastformula status:', res.statusCode);
});
https.get('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/C3H8/PNG', (res) => {
  console.log('name formula status:', res.statusCode);
});
