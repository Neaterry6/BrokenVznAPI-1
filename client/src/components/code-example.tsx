interface CodeExampleProps {
  language: string;
  icon: string;
  code: string;
  title?: string;
}

export default function CodeExample({ language, icon, code, title }: CodeExampleProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden" data-testid={`code-example-${language.toLowerCase()}`}>
      <div className="bg-muted px-4 py-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <i className={icon}></i>
          <span className="font-medium text-foreground" data-testid={`text-language-${language.toLowerCase()}`}>
            {title || language}
          </span>
        </div>
      </div>
      <div className="code-block p-4">
        <pre className="font-mono text-sm text-gray-100 overflow-x-auto" data-testid={`code-content-${language.toLowerCase()}`}>
          <code dangerouslySetInnerHTML={{ __html: code }} />
        </pre>
      </div>
    </div>
  );
}
