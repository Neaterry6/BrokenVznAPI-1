import fs from 'fs';

let content = fs.readFileSync('client/src/pages/dashboard.tsx', 'utf-8');

// Find the handleTest function
const startMarker = 'const handleTest = async () => {';
const endMarker = '};';

const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
  console.log('Could not find handleTest');
  process.exit(1);
}

// Find the matching end (the one that closes the function)
let depth = 0;
let endIdx = startIdx;
for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') depth++;
  if (content[i] === '}') {
    depth--;
    if (depth === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

const newFunction = `const handleTest = async () => {
    if (!selectedEndpoint) return;
    setIsLoading(true);
    
    const baseUrl = window.location.origin;
    let url = baseUrl + selectedEndpoint.endpoint;
    let options: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
    };

    const params = new URLSearchParams();
    if (selectedEndpoint.method === 'GET') {
      Object.entries(testParams).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const qs = params.toString();
      if (qs) url += '?' + qs;
    } else {
      options.method = 'POST';
      options.body = JSON.stringify(testParams);
    }

    try {
      const response = await fetch(url, options);
      const ct = response.headers.get('content-type') || '';
      const result = ct.includes('json') ? await response.json() : { raw: await response.text() };
      
      setTestResult({ status: response.status, statusText: response.statusText, url, data: result });
      toast({
        title: response.ok ? 'Success' : 'Failed',
        description: selectedEndpoint.name + ': ' + response.status,
        variant: response.ok ? 'default' : 'destructive',
      });
    } catch (error: any) {
      setTestResult({ status: 0, statusText: 'Error', url, data: { error: error.message } });
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };`;

content = content.substring(0, startIdx) + newFunction + content.substring(endIdx + 1);
fs.writeFileSync('client/src/pages/dashboard.tsx', content);
console.log('Fixed handleTest function');
