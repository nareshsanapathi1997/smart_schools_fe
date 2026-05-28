const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "../public/downloads");
const outFile = path.join(outDir, "admission-brochure.pdf");

const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 280>>stream
BT /F1 20 Tf 50 740 Td (Smart International School) Tj 0 -28 Td /F1 14 Tf (Admission Brochure 2026-27) Tj 0 -40 Td /F1 11 Tf (Admissions Open - Apply Today!) Tj 0 -24 Td (Phone: +91 98765 43210) Tj 0 -18 Td (Email: info@smartschool.edu) Tj 0 -18 Td (Visit: smartschool.edu/admissions) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000598 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
667
%%EOF`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, pdf);
console.log("Created", outFile, fs.statSync(outFile).size, "bytes");
