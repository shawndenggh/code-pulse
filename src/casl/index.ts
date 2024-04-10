import { createMongoAbility } from "@casl/ability";

type Actions = "create" | "read" | "update" | "delete";
type Subjects = "Article" | "Comment" | "User";

const ability = createMongoAbility<[Actions, Subjects]>();

const readArticle = ability.can("read", "Article");
console.log(`readArticle: ${readArticle}`)
