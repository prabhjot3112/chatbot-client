export interface ChatbotOptions {
  domain?: string | number;
  chatbotName?: string;
  theme?: string;
  data?: string;
  apiSchema?: Array<{
    name: string;
    description: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    url: string;

    // Parameters describe what this API expects
    parameters?: {
      path?: string[];   // for {placeholders} in URL
      query?: string[];  // for ?key=value filters
      instructions?:string
    };
  }>;
}
