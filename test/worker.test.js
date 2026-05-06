import assert from "node:assert/strict";
import test from "node:test";

import { __testables } from "../src/worker.js";

const { extractAmount, fallbackClassify, isSupportedCurrency, normalizeCurrency, normalizeIntent, normalizeSearchText } = __testables;

test("fallback parser recognizes a simple taxi expense", () => {
  const intent = fallbackClassify("1400 такси");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 1400);
  assert.equal(intent.category, "Транспорт");
  assert.equal(intent.subcategory, "Такси");
});

test("fallback parser recognizes amounts attached to KZT markers", () => {
  const intent = fallbackClassify("1500тг такси");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 1500);
  assert.equal(intent.currency, "KZT");
  assert.equal(intent.category, "Транспорт");
});

test("fallback parser ignores calendar numbers before the amount", () => {
  const intent = fallbackClassify("такси 1 мая 1500");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 1500);
  assert.equal(intent.date_text, null);
});

test("fallback parser treats period numbers as analytics, not expenses", () => {
  const intent = fallbackClassify("сколько потратил за 30 дней");

  assert.equal(intent.kind, "analytics");
  assert.equal(intent.amount, null);
  assert.equal(intent.period, "last_30_days");
});

test("fallback parser recognizes income", () => {
  const intent = fallbackClassify("зарплата 350000");

  assert.equal(intent.kind, "income");
  assert.equal(intent.amount, 350000);
});

test("fallback parser recognizes giving money as debt", () => {
  const intent = fallbackClassify("дал сестре 5000 в долг");

  assert.equal(intent.kind, "loan_out");
  assert.equal(intent.amount, 5000);
  assert.equal(intent.counterparty, "сестра");
});

test("fallback parser keeps non-debt family support in family help", () => {
  const intent = normalizeIntent(fallbackClassify("скинул сестре 30000"), "скинул сестре 30000", {});

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 30000);
  assert.equal(intent.category, "Семья");
  assert.equal(intent.subcategory, "Помощь семье");
});

test("fallback parser does not treat returned-to-me debt as my repayment", () => {
  const intent = fallbackClassify("вернул мне долг 2000");

  assert.equal(intent.kind, "loan_repayment");
  assert.equal(intent.amount, 2000);
});

test("fallback parser recognizes my debt repayment to another person", () => {
  const intent = fallbackClassify("вернул другу долг 3000");

  assert.equal(intent.kind, "borrow_repayment");
  assert.equal(intent.amount, 3000);
});

test("fallback parser recognizes analytics periods", () => {
  assert.equal(fallbackClassify("сколько потратил за неделю?").period, "week");
  assert.equal(fallbackClassify("траты за последние 7 дней").period, "last_7_days");
});

test("currency policy is explicit KZT-only", () => {
  assert.equal(normalizeCurrency("₸"), "KZT");
  assert.equal(normalizeCurrency("usd"), "USD");
  assert.equal(isSupportedCurrency("KZT"), true);
  assert.equal(isSupportedCurrency("USD"), false);

  const intent = normalizeIntent(
    {
      kind: "expense",
      amount: 10,
      currency: "USD",
      category: null,
      subcategory: null,
      counterparty: null,
      description: "coffee",
      date_text: null,
      period: null,
      confidence: 1,
      needs_confirmation: false
    },
    "coffee 10 usd",
    {}
  );
  assert.equal(intent.currency, "USD");
  assert.equal(isSupportedCurrency(intent.currency), false);
});

test("amount extraction supports common spacing and rejects period-only numbers", () => {
  assert.equal(extractAmount("такси 1 500 тг"), 1500);
  assert.equal(extractAmount("сколько за 30 дней"), null);
});

test("search text normalization handles russian case and yo", () => {
  assert.equal(normalizeSearchText("Ёлка, ЕДА и Такси!"), "елка еда и такси");
});
