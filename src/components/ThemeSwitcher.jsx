import { Button, Tooltip, message } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { saveTheme, selectTheme, setGuestTheme } from '../store/authSlice';

export default function ThemeSwitcher() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const { isAuthenticated, themeSaving, loading } = useSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${nextTheme} mode`;

  const toggleTheme = async () => {
    if (!isAuthenticated) {
      dispatch(setGuestTheme(nextTheme));
      return;
    }
    try {
      await dispatch(saveTheme(nextTheme)).unwrap();
    } catch (error) {
      if (error?.name !== 'ConditionError') {
        messageApi.error(typeof error === 'string' ? error : 'Could not save your theme. Please try again.');
      }
    }
  };

  return (
    <>
      {contextHolder}
      <Tooltip title={label}>
        <Button
          className="portal-theme-switch"
          aria-label={label}
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          loading={themeSaving}
          disabled={loading || themeSaving}
          onClick={toggleTheme}
        />
      </Tooltip>
    </>
  );
}
