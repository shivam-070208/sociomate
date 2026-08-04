export interface PublishMessage<T> {
  exchange: string;
  routingKey: string;
  payload: T;
  options?: {
    persistent?: boolean;
    contentType?: string;
    headers?: Record<string, unknown>;
  };
}
