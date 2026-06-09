import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
   await knex.raw(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"
   `);

   await knex.schema.createTable("users", (table) => {
      table
         .uuid("id")
         .primary()
         .defaultTo(knex.raw("gen_random_uuid()"));//gerar id auttomaticmaente
         
      table.string("name", 255).notNullable();
      table.string("email", 255).unique().notNullable();
      table.string("google_id", 255).unique();
      table.text("avatar");
      table.timestamp("created_at").defaultTo(knex.fn.now()); //fn = funcao 
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      
      table.index(["email"]);
      table.index(["google_id"]);
   });
}


export async function down(knex: Knex): Promise<void> {
   await knex.schema.dropTableIfExists("users");
}

