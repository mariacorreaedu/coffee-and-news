import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
   await knex.schema.createTable("refresh_tokens", (table) => {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
  
      table
        .uuid("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE")
        .notNullable();
  
      table.text("token").unique().notNullable();
  
      table.timestamp("expires_at").notNullable();
  
      table.timestamp("created_at").defaultTo(knex.fn.now());
  
      table.index(["token"]);
      table.index(["user_id"]);
    });
}


export async function down(knex: Knex): Promise<void> {
}

