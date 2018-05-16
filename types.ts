export interface Header {
  name: string;
  value: string;
}

export interface Timings {
  blocked: number;
  dns: number;
  ssl: number;
  connect: number;
  send: number;
  wait: number;
  receive: number;
  _blocking_queueing: number;
}

export interface Har {
  log: {
    version: string;
    pages: Array<{
      startedDateTime: string;
      id: string;
      title: string;
      pageTimings: {
        onContentLoad: number;
        onLoad: number;
      };
    }>;
    entries: Array<{
      startedDateTime: string;
      time: number;
      timings: Timings;
      request: {
        method: string;
        url: string;
        httpVersion: string;
        headers: Header[];
        queryString: string[];
        cookies: string[];
        headerSize: number;
        bodySize: number;
      };
      response: {
        status: number;
        statusText: string;
        httpVersion: string;
        headers: Header[];
        cookies: string[];
        content: {
          size: number;
          mimeTime: string;
          text?: string;
          encoding: string;
        };
        redirectURL: string;
        headersSize: number;
        bodySize: number;
        _transferSize: number;
        cache: {};

        serverIPAddress: string;
        connection: string;
        pageref: string;
      };
    }>;
  };
}
