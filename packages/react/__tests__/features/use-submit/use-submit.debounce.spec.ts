import { act, waitFor } from "@testing-library/react";
import { startServer, resetInterceptors, stopServer, createRequestInterceptor } from "../../server";
import { builder, createCommand, renderUseSubmit, waitForRender } from "../../utils";

describe("useSubmit [ Debounce ]", () => {
  const options = { debounce: true, debounceTime: 100 };

  let command = createCommand({ method: "POST" });

  beforeAll(() => {
    startServer();
  });

  afterEach(() => {
    resetInterceptors();
  });

  afterAll(() => {
    stopServer();
  });

  beforeEach(() => {
    jest.resetModules();
    builder.clear();
    command = createCommand({ method: "POST" });
  });

  describe("given debounce is active", () => {
    describe("when command is about to change", () => {
      it("should debounce single request", async () => {
        let submitTime = null;
        let startTime = null;
        createRequestInterceptor(command);
        const response = renderUseSubmit(command, options);

        act(() => {
          response.result.current.onSubmitRequestStart(() => {
            startTime = +new Date();
          });
          submitTime = +new Date();
          response.result.current.submit();
        });

        await waitFor(() => {
          expect(startTime).not.toBeNull();
        });

        expect(startTime - submitTime).toBeGreaterThanOrEqual(100);
        expect(startTime - submitTime).toBeLessThan(120);
      });
      it("should debounce multiple request triggers by 100ms", async () => {
        const spy = jest.fn();
        let submitTime = null;
        let startTime = null;
        createRequestInterceptor(command);
        const response = renderUseSubmit(command, options);

        await act(async () => {
          response.result.current.onSubmitRequestStart(() => {
            spy();
            startTime = +new Date();
          });
          submitTime = +new Date();
          response.result.current.submit();
          await waitForRender(20);
          response.result.current.submit();
          await waitForRender(20);
          response.result.current.submit();
          await waitForRender(20);
          response.result.current.submit();
        });

        await waitFor(() => {
          expect(startTime).not.toBeNull();
        });

        expect(startTime - submitTime).toBeGreaterThanOrEqual(160);
        expect(startTime - submitTime).toBeLessThan(180);
        expect(spy).toBeCalledTimes(1);
      });
    });
  });

  describe("given debounce is off", () => {
    describe("when command is about to change", () => {
      it("should not debounce multiple request triggers", async () => {
        const spy = jest.fn();
        let submitTime = null;
        let startTime = null;
        createRequestInterceptor(command, { delay: 0 });
        const response = renderUseSubmit(command);

        await act(async () => {
          response.result.current.onSubmitRequestStart(() => {
            spy();
            startTime = +new Date();
          });
          submitTime = +new Date();
          response.result.current.submit();
          await waitForRender(20);
          response.result.current.submit();
          await waitForRender(20);
          response.result.current.submit();
          await waitForRender(20);
          response.result.current.submit();
        });

        await waitFor(() => {
          expect(startTime).not.toBeNull();
        });

        expect(startTime - submitTime).toBeLessThan(100);
        expect(spy).toBeCalledTimes(4);
      });
    });
  });
});
