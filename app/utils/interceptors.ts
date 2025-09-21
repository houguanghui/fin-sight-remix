export const setupResponseInterceptors = () => {
  // 可以在这里添加全局的响应拦截逻辑
  // const originalFetch = window.fetch;

  // window.fetch = async (...args) => {
  //   const [input, init] = args;
    
  //   // 添加请求时间戳防止缓存
  //   const url = typeof input === 'string' ? input : input.url;
  //   const timestamp = new Date().getTime();
  //   const separator = url.includes('?') ? '&' : '?';
  //   const finalUrl = `${url}${separator}_t=${timestamp}`;

  //   try {
  //     const response = await originalFetch(finalUrl, init);
      
  //     // 可以在这里添加统一的响应处理逻辑
  //     if (!response.ok) {
  //       // 统一的错误处理
  //       console.error('API Error:', response.status, response.statusText);
  //     }
      
  //     return response;
  //   } catch (error) {
  //     console.error('Fetch Error:', error);
  //     throw error;
  //   }
  // };
};

// 在应用初始化时调用
// setupResponseInterceptors();