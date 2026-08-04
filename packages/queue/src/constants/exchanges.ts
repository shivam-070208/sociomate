export const EXCHANGE_NAME =
  process.env.RABBITMQ_EXCHANGE ?? "sociomate.exchange";
export const EXCHANGE_TYPE = process.env.RABBITMQ_EXCHANGE_TYPE ?? "direct";
export const EXCHANGE_DURABLE = true;
