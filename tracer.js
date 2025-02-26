const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'frontend-service',
  }),
  traceExporter: new OTLPTraceExporter({
    // 환경 변수에서 엔드포인트를 가져오거나 기본값 사용
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://opentelemetry-collector.monitoring:4317',
    headers: {},
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});
sdk.start()
  .then(() => console.log('Tracing initialized'))
  .catch((error) => console.error('Error initializing tracing', error));