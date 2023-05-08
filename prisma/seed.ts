import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const tags = [
  // frameworks
  ".net",
  "angular",
  "deno",
  "django",
  "express",
  "nextjs",
  "phoenix",
  "rails",
  "react native",
  "react",
  "remix",
  "stimulus",
  "svelte",
  "electron",
  "tailwind",

  // lang
  "assembly",
  "c#",
  "c++",
  "clojure",
  "elixir",
  "erlang",
  "golang",
  "haskel",
  "java",
  "javascript",
  "julia",
  "ocaml",
  "python",
  "ruby",
  "rust",
  "swift",
  "typescript",

  // db, kv store
  "dynamo",
  "elasticsearch",
  "firestore",
  "mongodb",
  "mysql",
  "postgis",
  "postgres",
  "prisma",
  "psql",
  "redis",
  "sql",
  "sqlite",

  // cloud infra
  "aws",
  "azure",
  "cloudflare",
  "firebase",
  "flyio",
  "google cloud",
  "heroku",
  "kubernetes",
  "terraform",

  // ml
  "fastai",
  "hugging face",
  "keras",
  "machine learning",
  "ml",
  "numpy",
  "pandas",
  "pytorch",
  "tensorflow",
  "transformers",

  // misc
  "blockchain",
  "docker",
  "gql",
  "graphql",
  "web3",
  "hotwire",
  "devops",
  "sre",
  "full stack"
];

async function main() {
  console.log('Adding tag seeds ... ')
  const response = await prisma.tag.createMany({
    data: tags.map((tag) => ({ name: tag })),
    skipDuplicates: true,
  })
  console.log('Database has been seeded.', response)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })