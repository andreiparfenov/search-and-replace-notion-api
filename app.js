const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const searchValue = "GitHub";
const newValue = "GitLab";

(async () => {
  const db = await notion.databases.query({
    database_id: process.env.NOTION_API_DATABASE,
  });

  for (const page of db.results) {
    const blocks = await retrieveBlocks(page.id);
    findAndReplace(blocks);
  }
})();

async function retrieveBlocks(pageId) {
  const page = await notion.blocks.children.list({
    block_id: pageId,
  });

  return page.results;
}

async function findAndReplace(blocks) {
  for (const block of blocks) {
    const textItems = block.paragraph.rich_text;
    if (!textItems.length) continue;
    const newTextItems = textItems.map((item) => {
      const selectedText = item.text.content;
      const newText = selectedText.includes(searchValue)
        ? selectedText.replaceAll(searchValue, newValue)
        : selectedText;
      item.text.content = newText;
      return item;
    });
    await updateBlock(block, newTextItems);
  }
}

async function updateBlock(block, newTextItems) {
  const selectedBlock = await notion.blocks.update({
    block_id: block.id,
    paragraph: {
      rich_text: newTextItems,
    },
  });
}
