import { useState } from 'react';
import axios from 'axios';
import { AxiosMockKit } from 'react-axios-mockkit';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

const App = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const postData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/posts', {
        title: 'foo',
        body: 'bar',
        userId: 1,
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataWithParams = async () => {
    setLoading(true);
    setError(null);
    try {
      // Example of passing params via object, which should be merged into URL for matching
      const response = await api.get('/comments', { 
        params: { postId: 1 } 
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AxiosMockKit instance={api}>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Playground</h1>
        <p>Use the buttons below to trigger requests. Open the MockKit panel (bottom right) to see logs and mock them.</p>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => fetchData('/todos/1')}>Get Todo 1</button>
          <button onClick={() => fetchData('/todos/2')}>Get Todo 2</button>
          <button onClick={() => fetchData('/todos/videos')}>Get Todo - Videos</button>
          <button onClick={() => fetchData('/users/1')}>Get User 1</button>
          <button onClick={() => fetchData('/posts')}>Get Posts</button>
          <button onClick={() => fetchData('/posts?userId=1')}>Get Posts (Query String)</button>
          <button onClick={fetchDataWithParams}>Get Comments (Params Object)</button>
          <button onClick={postData}>Create Post</button>
          <button onClick={() => fetchData('/error-endpoint')}>Get 404</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && (
          <pre style={{ background: '#eee', padding: '10px', borderRadius: '5px', maxHeight: '400px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </AxiosMockKit>
  );
};

export default App;
