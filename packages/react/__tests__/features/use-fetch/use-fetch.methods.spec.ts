import { act, waitFor } from "@testing-library/react";
import { startServer, resetInterceptors, stopServer, createRequestInterceptor } from "../../server";
import { testErrorState, testSuccessState } from "../../shared";
import { builder, createCommand, renderUseFetch } from "../../utils";

describe("useFetch [ Methods ]", () => {
  let command = createCommand();

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
    command = createCommand();
    builder.clear();
  });

  describe("given hook is mounted", () => {
    describe("when processing request", () => {
      it("should trigger onRequestStart helper", async () => {
        const spy = jest.fn();
        const mock = createRequestInterceptor(command);
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onRequestStart(spy);
        });

        await testSuccessState(mock, response);
        expect(spy).toBeCalledTimes(1);
      });
      it("should trigger onResponseStart helper", async () => {
        const spy = jest.fn();
        const mock = createRequestInterceptor(command);
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onResponseStart(spy);
        });

        await testSuccessState(mock, response);
        expect(spy).toBeCalledTimes(1);
      });
      it("should trigger onDownloadProgress helper", async () => {
        const spy = jest.fn();
        const mock = createRequestInterceptor(command);
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onDownloadProgress(spy);
        });

        await testSuccessState(mock, response);
        expect(spy).toBeCalledTimes(3);
      });
      it("should trigger onUploadProgress helper", async () => {
        const spy = jest.fn();
        const mock = createRequestInterceptor(command);
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onUploadProgress(spy);
        });

        await testSuccessState(mock, response);
        expect(spy).toBeCalledTimes(2);
      });
    });
    describe("when getting the response", () => {
      it("should trigger onSuccess helper", async () => {
        const spy = jest.fn();
        const unusedSpy = jest.fn();
        const mock = createRequestInterceptor(command);
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onSuccess(spy);
          response.result.current.onError(unusedSpy);
        });

        await testSuccessState(mock, response);
        expect(spy).toBeCalledTimes(1);
        expect(unusedSpy).toBeCalledTimes(0);
      });
      it("should trigger onError helper", async () => {
        const spy = jest.fn();
        const unusedSpy = jest.fn();
        const mock = createRequestInterceptor(command, { status: 400 });
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onError(spy);
          response.result.current.onSuccess(unusedSpy);
        });

        await testErrorState(mock, response);
        expect(spy).toBeCalledTimes(1);
        expect(unusedSpy).toBeCalledTimes(0);
      });
      it("should trigger onFinished helper on success", async () => {
        const spy = jest.fn();
        const mock = createRequestInterceptor(command);
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onFinished(spy);
        });

        await testSuccessState(mock, response);
        expect(spy).toBeCalledTimes(1);
      });
      it("should trigger onFinished helper on error", async () => {
        const spy = jest.fn();
        const mock = createRequestInterceptor(command, { status: 400 });
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onFinished(spy);
        });

        await testErrorState(mock, response);
        expect(spy).toBeCalledTimes(1);
      });
    });
    describe("when getting internal error", () => {
      it("should trigger onOfflineError helper", async () => {
        const spy = jest.fn();
        createRequestInterceptor(command, { status: 400 });
        const response = renderUseFetch(command.setOffline(true));

        act(() => {
          response.result.current.onOfflineError(spy);
          builder.appManager.setOnline(false);
        });

        await waitFor(() => {
          expect(spy).toBeCalledTimes(1);
        });
      });
      it("should trigger methods on retry", async () => {
        const spy1 = jest.fn();
        const spy2 = jest.fn();
        const spy3 = jest.fn();
        const spy4 = jest.fn();
        const spy5 = jest.fn();
        const spy6 = jest.fn();
        const spy7 = jest.fn();
        const spy8 = jest.fn();

        const errorMock = createRequestInterceptor(command, { status: 400 });
        const response = renderUseFetch(command.setRetry(1).setRetryTime(100));

        act(() => {
          response.result.current.onRequestStart(spy1);
          response.result.current.onResponseStart(spy2);
          response.result.current.onDownloadProgress(spy3);
          response.result.current.onUploadProgress(spy4);
          response.result.current.onSuccess(spy5);
          response.result.current.onError(spy6);
          response.result.current.onFinished(spy7);
          response.result.current.onOfflineError(spy8);
        });

        await testErrorState(errorMock, response);
        const successMock = createRequestInterceptor(command);
        await testSuccessState(successMock, response);

        expect(spy1).toBeCalledTimes(2);
        expect(spy2).toBeCalledTimes(2);
        expect(spy3).toBeCalledTimes(6);
        expect(spy4).toBeCalledTimes(4);
        expect(spy5).toBeCalledTimes(1);
        expect(spy6).toBeCalledTimes(1);
        expect(spy7).toBeCalledTimes(2);
        expect(spy8).toBeCalledTimes(0);
      });
      it("should trigger methods on coming back online", async () => {
        const spy1 = jest.fn();
        const spy2 = jest.fn();
        const spy3 = jest.fn();
        const spy4 = jest.fn();
        const spy5 = jest.fn();
        const spy6 = jest.fn();
        const spy7 = jest.fn();
        const spy8 = jest.fn();

        const errorMock = createRequestInterceptor(command, { status: 400 });
        const response = renderUseFetch(command);

        act(() => {
          response.result.current.onRequestStart(spy1);
          response.result.current.onResponseStart(spy2);
          response.result.current.onDownloadProgress(spy3);
          response.result.current.onUploadProgress(spy4);
          response.result.current.onSuccess(spy5);
          response.result.current.onError(spy6);
          response.result.current.onFinished(spy7);
          response.result.current.onOfflineError(spy8);
          builder.appManager.setOnline(false);
        });

        await testErrorState(errorMock, response);
        const successMock = createRequestInterceptor(command);

        act(() => {
          builder.appManager.setOnline(true);
        });

        await testSuccessState(successMock, response);
        expect(spy1).toBeCalledTimes(2);
        expect(spy2).toBeCalledTimes(2);
        expect(spy3).toBeCalledTimes(6);
        expect(spy4).toBeCalledTimes(4);
        expect(spy5).toBeCalledTimes(1);
        expect(spy6).toBeCalledTimes(0);
        expect(spy7).toBeCalledTimes(2);
        expect(spy8).toBeCalledTimes(1);
      });
    });
  });
});
