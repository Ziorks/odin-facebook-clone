const indexRouter = require("../routes/indexRouter");

const request = require("supertest");
const express = require("express");
const { describe, it, expect } = require("@jest/globals");

const app = express();

app.use("/", indexRouter);

describe("/api/v1", () => {
  describe("get index route", () => {
    describe("given a normal request is made", () => {
      it('should return a 200 status and the text "you\'ve reached the index route"', async () => {
        const { text } = await request(app).get("/").expect(200);
        expect(text).toEqual("you've reached the index route");
      });
    });
  });
});
