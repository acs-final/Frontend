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
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://opentelemetry-collector.monitoring:4317',
    headers: {},
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

// 비동기 함수로 감싸고 실행
async function initializeTracing() {
  try {
    await sdk.start(); // 비동기 실행
    console.log('Tracing initialized');
  } catch (error) {
    console.error('Error initializing tracing', error);
  }
}

initializeTracing();
