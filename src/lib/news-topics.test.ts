import test from "node:test";
import assert from "node:assert/strict";
import { filterNews, newsTopic } from "./news-topics.ts";
test("publisher topics keep unmatched news honest and classify current headline subjects", () => {
  assert.equal(newsTopic("OpenAI introduces a new model"), "AI & ML");
  assert.equal(newsTopic("New laptop processors arrive"), "Hardware");
  assert.equal(newsTopic("A company announces its earnings"), "General tech");
});
test("headline filtering composes source search and topic, newest first", () => {
  const item = {id:"a", title:"OpenAI model", source:"WIRED", url:"https://wired.com/a", published:"2026-10-08T12:00:00Z", fetched:"2026-10-09T12:00:00Z"};
  const news = [item, {...item,id:"b",published:"2026-10-09T12:00:00Z"}];
  assert.equal(filterNews(news,"wired","AI & ML")[0].id,"b");
  assert.equal(filterNews(news,"wired","Hardware").length,0);
});
