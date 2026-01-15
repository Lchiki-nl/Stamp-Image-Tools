
type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export const JsonLd = ({ data }: { data: JsonLdData }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

