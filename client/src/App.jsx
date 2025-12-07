import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setResult(null)
    setError(null)

    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('document', file)

    try {
      const response = await fetch('http://localhost:3000/api/analyze-bill', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>MedDoc Analyzer</h1>
        <p>Upload a bill to extract value, amounts, and currency instantly.</p>
      </div>

      <div className="upload-card">
        <div className="file-input-wrapper">
          <input type="file" onChange={handleFileChange} accept="image/*" />
          <div className="upload-placeholder">
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            ) : (
              <>
                <div className="upload-icon">📄</div>
                <p style={{ fontWeight: 500 }}>Click to upload or drag and drop</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Supported formats: JPG, PNG, WEBP</p>
              </>
            )}
          </div>
        </div>

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={!file || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Document'}
        </button>

        {error && (
          <div style={{ marginTop: '1rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
            Error: {error}
          </div>
        )}
      </div>

      {result && (
        <div className="results-section">
          <div className="upload-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Analysis Results</h2>
              <span className={`status-badge ${result.status === 'ok' ? 'status-ok' : 'status-error'}`}>
                {result.status.toUpperCase()}
              </span>
            </div>

            {result.currency && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Detected Currency: </span>
                <strong style={{ fontSize: '1.2rem' }}>{result.currency}</strong>
              </div>
            )}

            {result.amounts ? (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extracted Amounts</h3>
                {result.amounts.map((amt, idx) => (
                  <div key={idx} className="amount-card">
                    <div>
                      <div className="amount-type">{amt.type.replace('_', ' ')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Source: "{amt.source}"</div>
                    </div>
                    <div className="amount-value">{amt.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No financial amounts detected.</p>
            )}

            <details>
              <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>View Raw JSON</summary>
              <pre className="json-display">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
