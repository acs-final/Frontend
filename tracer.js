// tracer.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const traceExporter = new OTLPTraceExporter({
  // 필요한 경우 엔드포인트나 기타 설정을 추가
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
  console.log('Tracing initialized');
} catch (error) {
  console.error('Error initializing tracing', error);
}
