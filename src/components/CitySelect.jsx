import React, { useEffect, useRef, useState } from 'react';
import { Button, Select, Spin } from 'antd';
import api from '../api';

// Stores the existing location string, so older profiles need no migration.
export default function CitySelect({ value, onChange, emptyValue, placeholder = 'Search for a city anywhere in the world', ...props }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef(null);
  const controller = useRef(null);
  const requestId = useRef(0);

  useEffect(() => () => {
    clearTimeout(timer.current);
    controller.current?.abort();
    requestId.current += 1;
  }, []);

  const search = (text) => {
    setQuery(text);
    setOptions([]);
    setError('');
    clearTimeout(timer.current);
    controller.current?.abort();
    const id = ++requestId.current;
    if (text.trim().length < 2) { setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const abort = new AbortController();
      controller.current = abort;
      try {
        const response = await api.get('/api/locations/cities', { params: { q: text.trim() }, signal: abort.signal });
        if (id === requestId.current) setOptions(response.data.cities);
      } catch (err) {
        if (!abort.signal.aborted && id === requestId.current) {
          setError(err.response?.data?.error || 'City search is unavailable. Please try again.');
        }
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 400);
  };

  const selectedOptions = Array.isArray(value) ? value.map(v => ({ value: v, label: v })) : (value ? [{ value, label: value }] : []);
  const displayedOptions = !query && selectedOptions.length > 0 ? selectedOptions : options;
  return <Select
    {...props}
    value={value}
    showSearch
    searchValue={query}
    filterOption={false}
    allowClear
    loading={loading}
    options={displayedOptions}
    placeholder={placeholder}
    onSearch={search}
    onChange={(city) => { if (props.mode !== 'multiple') search(''); onChange?.(city ?? emptyValue); }}
    onOpenChange={(open) => { if (!open) search(''); }}
    notFoundContent={loading ? <Spin size="small" /> : <div role="status">
      {error || (query.trim().length < 2 ? 'Type at least 2 characters to find your city.' : 'No cities found. Try a nearby city or add the country name.')}
      {error && <Button type="link" size="small" onClick={() => search(query)}>Retry</Button>}
    </div>}
    popupRender={menu => <>
      {menu}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--portal-card-border)', fontSize: 11, color: 'var(--theme-muted)' }}>
        City data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> · <a href="https://photon.komoot.io" target="_blank" rel="noreferrer">Photon</a>
      </div>
    </>}
    style={{ width: '100%', ...props.style }}
  />;
}
