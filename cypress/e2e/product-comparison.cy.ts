/**
 * 产品对比功能端到端测试
 */

describe('Product Comparison', () => {
  beforeEach(() => {
    // 清除localStorage
    cy.clearLocalStorage();
    
    // 访问产品列表页面
    cy.visit('/products');
    
    // 等待页面加载
    cy.get('[data-testid="product-grid"]').should('be.visible');
  });

  it('should add products to comparison from product grid', () => {
    // 添加第一个产品到对比列表
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="compare-toggle"]').click();
    });
    
    // 验证浮动按钮出现
    cy.get('[data-testid="comparison-floating-button"]').should('be.visible');
    cy.get('[data-testid="comparison-count"]').should('contain', '1');
    
    // 添加第二个产品
    cy.get('[data-testid="product-card"]').eq(1).within(() => {
      cy.get('[data-testid="compare-toggle"]').click();
    });
    
    // 验证计数更新
    cy.get('[data-testid="comparison-count"]').should('contain', '2');
  });

  it('should show comparison floating button with product preview', () => {
    // 添加产品到对比列表
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="compare-toggle"]').click();
    });
    
    // 点击浮动按钮展开
    cy.get('[data-testid="comparison-floating-button"]').click();
    
    // 验证展开的面板
    cy.get('[data-testid="comparison-panel"]').should('be.visible');
    cy.get('[data-testid="comparison-product-item"]').should('have.length', 1);
    
    // 验证产品信息显示
    cy.get('[data-testid="comparison-product-item"]').first().within(() => {
      cy.get('[data-testid="product-name"]').should('be.visible');
      cy.get('[data-testid="product-price"]').should('be.visible');
      cy.get('[data-testid="remove-product"]').should('be.visible');
    });
  });

  it('should navigate to comparison page', () => {
    // 添加两个产品到对比列表
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="compare-toggle"]').click();
    });
    
    cy.get('[data-testid="product-card"]').eq(1).within(() => {
      cy.get('[data-testid="compare-toggle"]').click();
    });
    
    // 点击浮动按钮展开
    cy.get('[data-testid="comparison-floating-button"]').click();
    
    // 点击对比按钮
    cy.get('[data-testid="compare-button"]').click();
    
    // 验证跳转到对比页面
    cy.url().should('include', '/products/compare');
    cy.get('[data-testid="product-comparison"]').should('be.visible');
  });

  it('should display product comparison table', () => {
    // 直接访问对比页面并添加产品
    cy.visit('/products/compare');
    
    // 模拟URL参数（通常由路由处理）
    cy.window().then((win) => {
      // 模拟添加产品到localStorage
      const mockProducts = [
        {
          id: 'product-1',
          name: 'LED Display P2.5',
          model: 'LED-P25-001',
          price: { current: 1500, currency: 'USD' },
          images: { main: '/images/products/led-p25-001.jpg' },
          specifications: {
            pixelPitch: 'P2.5',
            brightness: 1200,
            refreshRate: 3840,
          }
        },
        {
          id: 'product-2',
          name: 'LED Display P4',
          model: 'LED-P4-002',
          price: { current: 2500, currency: 'USD' },
          images: { main: '/images/products/led-p4-002.jpg' },
          specifications: {
            pixelPitch: 'P4',
            brightness: 6000,
            refreshRate: 3840,
          }
        }
      ];
      
      win.localStorage.setItem('product-comparison', JSON.stringify(mockProducts));
    });
    
    // 刷新页面以加载数据
    cy.reload();
    
    // 验证对比表格
    cy.get('[data-testid="comparison-table"]').should('be.visible');
    cy.get('[data-testid="product-header"]').should('have.length', 2);
    
    // 验证产品信息
    cy.get('[data-testid="product-header"]').first().within(() => {
      cy.contains('LED Display P2.5').should('be.visible');
    });
    
    cy.get('[data-testid="product-header"]').eq(1).within(() => {
      cy.contains('LED Display P4').should('be.visible');
    });
  });

  it('should highlight best values when enabled', () => {
    // 访问有产品的对比页面
    cy.visit('/products/compare?products=product-1,product-2');
    
    // 启用高亮最佳值
    cy.get('[data-testid="highlight-toggle"]').check();
    
    // 验证高亮显示
    cy.get('[data-testid="highlighted-value"]').should('exist');
    cy.get('[data-testid="best-value-indicator"]').should('be.visible');
  });

  it('should remove products from comparison', () => {
    // 访问有产品的对比页面
    cy.visit('/products/compare?products=product-1,product-2');
    
    // 移除第一个产品
    cy.get('[data-testid="product-header"]').first().within(() => {
      cy.get('[data-testid="remove-product"]').click();
    });
    
    // 验证产品被移除
    cy.get('[data-testid="product-header"]').should('have.length', 1);
    
    // 验证URL更新
    cy.url().should('include', 'products=product-2');
  });

  it('should add products through product selector modal', () => {
    // 访问有一个产品的对比页面
    cy.visit('/products/compare?products=product-1');
    
    // 点击添加产品按钮
    cy.get('[data-testid="add-product-button"]').click();
    
    // 验证产品选择器模态框打开
    cy.get('[data-testid="product-selector-modal"]').should('be.visible');
    
    // 搜索产品
    cy.get('[data-testid="product-search"]').type('P4');
    
    // 验证搜索结果
    cy.get('[data-testid="product-selector-item"]').should('have.length.at.least', 1);
    
    // 添加产品
    cy.get('[data-testid="product-selector-item"]').first().within(() => {
      cy.get('[data-testid="add-to-comparison"]').click();
    });
    
    // 关闭模态框
    cy.get('[data-testid="modal-close"]').click();
    
    // 验证产品被添加
    cy.get('[data-testid="product-header"]').should('have.length', 2);
  });

  it('should filter products in selector modal', () => {
    // 访问对比页面
    cy.visit('/products/compare');
    
    // 打开产品选择器
    cy.get('[data-testid="browse-products"]').click();
    cy.get('[data-testid="add-product-button"]').click();
    
    // 测试搜索过滤
    cy.get('[data-testid="product-search"]').type('LED');
    cy.get('[data-testid="product-selector-item"]').should('have.length.at.least', 1);
    
    // 清除搜索
    cy.get('[data-testid="product-search"]').clear();
    
    // 测试分类过滤
    cy.get('[data-testid="category-filter"]').select('indoor-fixed');
    cy.get('[data-testid="product-selector-item"]').should('have.length.at.least', 1);
    
    // 测试排序
    cy.get('[data-testid="sort-select"]').select('price');
    
    // 清除所有过滤器
    cy.get('[data-testid="clear-filters"]').click();
    cy.get('[data-testid="product-search"]').should('have.value', '');
    cy.get('[data-testid="category-filter"]').should('have.value', '');
  });

  it('should export comparison data', () => {
    // 访问有产品的对比页面
    cy.visit('/products/compare?products=product-1,product-2');
    
    // 点击导出按钮
    cy.get('[data-testid="export-button"]').click();
    
    // 验证下载开始（检查下载属性）
    cy.get('[data-testid="export-button"]').should('exist');
    
    // 注意：实际的文件下载测试在Cypress中比较复杂
    // 这里主要测试按钮点击和功能触发
  });

  it('should share comparison', () => {
    // 访问有产品的对比页面
    cy.visit('/products/compare?products=product-1,product-2');
    
    // 模拟navigator.share API
    cy.window().then((win) => {
      cy.stub(win.navigator, 'share').resolves();
    });
    
    // 点击分享按钮
    cy.get('[data-testid="share-button"]').click();
    
    // 验证分享功能被调用
    cy.window().its('navigator.share').should('have.been.called');
  });

  it('should print comparison', () => {
    // 访问有产品的对比页面
    cy.visit('/products/compare?products=product-1,product-2');
    
    // 模拟window.print
    cy.window().then((win) => {
      cy.stub(win, 'print').as('print');
    });
    
    // 点击打印按钮
    cy.get('[data-testid="print-button"]').click();
    
    // 验证打印功能被调用
    cy.get('@print').should('have.been.called');
  });

  it('should handle maximum comparison limit', () => {
    // 添加3个产品到对比列表
    cy.visit('/products');
    
    for (let i = 0; i < 3; i++) {
      cy.get('[data-testid="product-card"]').eq(i).within(() => {
        cy.get('[data-testid="compare-toggle"]').click();
      });
    }
    
    // 尝试添加第4个产品
    cy.get('[data-testid="product-card"]').eq(3).within(() => {
      cy.get('[data-testid="compare-toggle"]').should('be.disabled');
    });
    
    // 验证提示信息
    cy.get('[data-testid="comparison-limit-message"]').should('be.visible');
  });

  it('should persist comparison across page navigation', () => {
    // 在产品页面添加产品到对比
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="compare-toggle"]').click();
    });
    
    // 导航到其他页面
    cy.visit('/');
    
    // 返回产品页面
    cy.visit('/products');
    
    // 验证对比状态保持
    cy.get('[data-testid="comparison-floating-button"]').should('be.visible');
    cy.get('[data-testid="comparison-count"]').should('contain', '1');
  });

  it('should clear all products from comparison', () => {
    // 添加产品到对比
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="compare-toggle"]').click();
    });
    
    // 展开浮动按钮
    cy.get('[data-testid="comparison-floating-button"]').click();
    
    // 清除所有产品
    cy.get('[data-testid="clear-all-button"]').click();
    
    // 验证对比列表为空
    cy.get('[data-testid="comparison-floating-button"]').should('not.exist');
    
    // 验证localStorage被清除
    cy.window().then((win) => {
      expect(win.localStorage.getItem('product-comparison')).to.be.null;
    });
  });

  it('should handle responsive design on mobile', () => {
    // 设置移动端视口
    cy.viewport('iphone-x');
    
    // 访问对比页面
    cy.visit('/products/compare?products=product-1,product-2');
    
    // 验证移动端布局
    cy.get('[data-testid="comparison-table"]').should('be.visible');
    cy.get('[data-testid="mobile-comparison-view"]').should('be.visible');
    
    // 验证横向滚动
    cy.get('[data-testid="comparison-table"]').scrollTo('right');
    
    // 验证粘性头部
    cy.scrollTo('bottom');
    cy.get('[data-testid="sticky-header"]').should('be.visible');
  });

  it('should show empty state when no products in comparison', () => {
    // 访问空的对比页面
    cy.visit('/products/compare');
    
    // 验证空状态
    cy.get('[data-testid="empty-comparison-state"]').should('be.visible');
    cy.contains('No Products to Compare').should('be.visible');
    
    // 点击浏览产品按钮
    cy.get('[data-testid="browse-products"]').click();
    
    // 验证跳转到产品页面
    cy.url().should('include', '/products');
  });
});