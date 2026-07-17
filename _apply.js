const fs = require("fs");
const { Client } = require("pg");
const sqlFile = process.argv[2];
const client = new Client({
  host: "aws-1-us-west-2.pooler.supabase.com", port: 5432, database: "postgres",
  user: "postgres.lcryemxxoncubipifgwy", password: "ProjetoNutri246",
  ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000,
});
(async () => {
  await client.connect();
  await client.query(fs.readFileSync(sqlFile, "utf8"));
  console.log("OK:", sqlFile);
  await client.end();
})().catch((e) => { console.error("ERRO:", e.message); process.exit(1); });
