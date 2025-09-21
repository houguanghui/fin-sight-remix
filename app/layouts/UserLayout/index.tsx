import {
  GithubFilled,
  InfoCircleFilled,
  QuestionCircleFilled,
} from '@ant-design/icons';
import type { ProSettings } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProLayout,
  SettingDrawer,
} from '@ant-design/pro-components';
import { Avatar, Image, Space } from 'antd';
import { useState } from 'react';
import defaultProps from '@/config/menu';
import type { Route } from "./+types/index";
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { EyeOutlined } from '@ant-design/icons';

export async function loader() {
  const response = await fetch('https://api.example.com/user')
  const serverSideData = await response.json()

  return {
    serverSideData,
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FinSight Pro" },
    { name: "description", content: "Welcome to FinSight Pro!" },
  ];
}

export default ({loaderData}: Route.ComponentProps) => {

  const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({});

  const location = useLocation();
  const [pathname, setPathname] = useState(location.pathname);
  const navigate = useNavigate();


  return (
    <div
      id="test-pro-layout"
      style={{
        height: '100vh',
      }}
    >
      <ProLayout
        logo={<EyeOutlined style={{ fontSize: '28px', color: '#1890ff' }} />}
        menuHeaderRender={(logo, title) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {logo}
            <span style={{
              color: '#1890ff',
              fontSize: '18px',
              fontWeight: 600,
              marginLeft: '8px',
              fontFamily: 'Inter, sans-serif',
            }}>
              FinSight Pro
            </span>
          </div>
        )}
        pageTitleRender = {false}
        menu={{type:'group'}}
        breadcrumbRender={false}
        bgLayoutImgList={[
          {
            src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
            left: 85,
            bottom: 100,
            height: '303px',
          },
          {
            src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
            bottom: -68,
            right: -45,
            height: '303px',
          },
          {
            src: 'https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png',
            bottom: 0,
            left: 0,
            width: '331px',
          },
        ]}
        {...defaultProps}
        location={{
          pathname,
        }}
        collapsed={false}
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            <div
              key={1}
              style={{
                height: '200px',
              }}
            >
              <Image
                width={'100%'}
                preview={false}
                height={132}
                src="https://gw.alipayobjects.com/zos/bmw-prod/d283f09a-64d6-4d59-bfc7-37b49ea0da2b.svg"
              />
              <Space
                align="center"
                size="middle"
                style={{
                  width: '100%',
                  marginBlockStart: '32px',
                }}
              >
                <Avatar
                  src="https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg"
                  size="small"
                />
                <div
                  style={{
                    fontSize: '14px',
                    marginInlineEnd: '32px',
                  }}
                >
                  七妮妮
                </div>
                <InfoCircleFilled key="InfoCircleFilled" />
                <QuestionCircleFilled key="QuestionCircleFilled" />
                <Link to="https://github.com/houguanghui/fin-sight-remix.git" target="_blank">
                  <GithubFilled key="GithubFilled" />
                </Link>
              </Space>
            </div>,
          ];
        }}
        menuRender={(props, defaultDom) => (
          <>
            {defaultDom}
          </>
        )}
        menuItemRender={(item, dom) => (
          <div
            onClick={() => {
              setPathname(item.path || '/')
              navigate(item.path || '/');
            }}
          >
            {dom}
          </div>
        )}
        {...settings}
      >
        <PageContainer>
          <ProCard
            style={{
              minHeight: '92vh',
            }}
          >
            <Outlet />
          </ProCard>
        </PageContainer>
      </ProLayout>
      <SettingDrawer
        pathname={pathname}
        enableDarkTheme
        getContainer={() => document.getElementById('test-pro-layout')}
        settings={settings}
        onSettingChange={(changeSetting) => {
          setSetting(changeSetting);
        }}
        disableUrlParams={false}
      />
    </div>
  );
};