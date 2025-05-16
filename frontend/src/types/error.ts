export type APIError = {
  response: {
    data: {
      status: "success" | "error";
      message: string;
      error?: string;
      errors?: {
        [key: string]: string[];
      };
    };
  };
};