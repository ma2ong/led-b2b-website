/**
 * 产品详情页面 E2E 测试
 */

describe('Product Detail Page', () => {
  beforeEach(() => {
    // 访问产品详情页面
    cy.visit('/products/test-led-display-p25');
    cy.wait(1000); // 等待页面加载
  });

  it('should display product information correctly', () => {
    // 检查产品基本信息
    cy.get('h1').should('contain', 'Test LED Display P2.5');
    cy.get('[data-testid="product-model"]').should('contain', 'TLD-P2.5-Indoor');
    cy.get('[data-testid="product-description"]').should('be.visible');
    
    // 检查价格显示
    cy.get('[data-testid="current-price"]').should('contain', '$299.99');
    cy.get('[data-testid="original-price"]').should('contain', '$349.99');
  });

  it('should handle image gallery interactions', () => {
    // 检查主图片显示
    cy.get('[data-testid="main-product-image"]').should('be.visible');
    
    // 点击缩略图切换主图片
    cy.get('[data-testid="thumbnail-gallery"]').within(() => {
      cy.get('button').eq(1).click();
    });
    
    // 验证主图片已切换
    cy.get('[data-testid="main-product-image"]')
      .should('have.attr', 'alt')
      .and('contain', 'Image 2');
    
    // 测试全屏功能
    cy.get('[data-testid="fullscreen-button"]').click();
    cy.get('[data-testid="fullscreen-modal"]').should('be.visible');
    cy.get('[data-testid="close-fullscreen"]').click();
    cy.get('[data-testid="fullscreen-modal"]').should('not.exist');
  });

  it('should handle quantity selection', () => {
    // 检查默认数量
    cy.get('[data-testid="quantity-input"]').should('have.value', '1');
    
    // 测试增加数量
    cy.get('[data-testid="quantity-increment"]').click();
    cy.get('[data-testid="quantity-input"]').should('have.value', '2');
    
    // 测试减少数量
    cy.get('[data-testid="quantity-decrement"]').click();
    cy.get('[data-testid="quantity-input"]').should('have.value', '1');
    
    // 测试直接输入数量
    cy.get('[data-testid="quantity-input"]').clear().type('5');
    cy.get('[data-testid="quantity-input"]').should('have.value', '5');
  });

  it('should switch between tabs correctly', () => {
    // 默认显示概览标签
    cy.get('[data-testid="tab-overview"]').should('have.class', 'border-primary-500');
    cy.get('[data-testid="overview-content"]').should('be.visible');
    
    // 切换到规格标签
    cy.get('[data-testid="tab-specs"]').click();
    cy.get('[data-testid="tab-specs"]').should('have.class', 'border-primary-500');
    cy.get('[data-testid="specs-content"]').should('be.visible');
    cy.get('[data-testid="overview-content"]').should('not.exist');
    
    // 检查规格信息
    cy.get('[data-testid="specs-content"]').within(() => {
      cy.contains('2.5mm').should('be.visible');
      cy.contains('1920 × 1080').should('be.visible');
      cy.contains('1200 nits').should('be.visible');
    });
    
    // 切换到评价标签
    cy.get('[data-testid="tab-reviews"]').click();
    cy.get('[data-testid="reviews-content"]').should('be.visible');
    
    // 切换到下载标签
    cy.get('[data-testid="tab-downloads"]').click();
    cy.get('[data-testid="downloads-content"]').should('be.visible');
    cy.contains('Product Datasheet').should('be.visible');
  });

  it('should display product features and applications', () => {
    // 检查产品特性
    cy.get('[data-testid="product-features"]').within(() => {
      cy.contains('High refresh rate').should('be.visible');
      cy.contains('Excellent color uniformity').should('be.visible');
      cy.contains('Easy maintenance').should('be.visible');
      cy.contains('Energy efficient').should('be.visible');
    });
    
    // 检查应用场景
    cy.get('[data-testid="product-applications"]').within(() => {
      cy.contains('Conference Rooms').should('be.visible');
      cy.contains('Retail Stores').should('be.visible');
      cy.contains('Control Centers').should('be.visible');
      cy.contains('Broadcasting Studios').should('be.visible');
    });
  });

  it('should show availability information', () => {
    cy.get('[data-testid="availability-section"]').within(() => {
      cy.contains('In Stock').should('be.visible');
      cy.contains('7-14 days').should('be.visible');
      cy.contains('10 units').should('be.visible');
    });
  });

  it('should handle inquiry form modal', () => {
    // 点击询价按钮
    cy.get('[data-testid="request-quote-button"]').click();
    
    // 检查模态框打开
    cy.get('[data-testid="inquiry-modal"]').should('be.visible');
    cy.contains('Request Quote for Test LED Display P2.5').should('be.visible');
    
    // 填写询价表单
    cy.get('[data-testid="inquiry-form"]').within(() => {
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="company"]').type('Test Company');
      cy.get('textarea[name="message"]').type('I am interested in this product.');
    });
    
    // 关闭模态框
    cy.get('[data-testid="close-modal"]').click();
    cy.get('[data-testid="inquiry-modal"]').should('not.exist');
  });

  it('should handle wishlist functionality', () => {
    // 点击收藏按钮
    cy.get('[data-testid="wishlist-button"]').click();
    
    // 验证按钮状态变化
    cy.get('[data-testid="wishlist-button"]')
      .should('have.class', 'text-red-500');
    
    // 再次点击取消收藏
    cy.get('[data-testid="wishlist-button"]').click();
    cy.get('[data-testid="wishlist-button"]')
      .should('not.have.class', 'text-red-500');
  });

  it('should display related products', () => {
    cy.get('[data-testid="related-products"]').should('be.visible');
    cy.contains('Related Products').should('be.visible');
    
    // 检查相关产品卡片
    cy.get('[data-testid="related-products"]').within(() => {
      cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
    });
    
    // 点击相关产品
    cy.get('[data-testid="related-products"]').within(() => {
      cy.get('[data-testid="product-card"]').first().click();
    });
    
    // 验证页面跳转
    cy.url().should('include', '/products/');
  });

  it('should handle share functionality', () => {
    // 模拟不支持 navigator.share 的浏览器
    cy.window().then((win) => {
      delete (win.navigator as any).share;
    });
    
    cy.get('[data-testid="share-button"]').click();
    
    // 在不支持原生分享的情况下，应该有其他分享方式
    // 这里可以检查是否显示了分享选项或复制链接功能
  });

  it('should be responsive on mobile devices', () => {
    // 切换到移动端视图
    cy.viewport('iphone-x');
    
    // 检查移动端布局
    cy.get('[data-testid="product-detail-container"]')
      .should('have.class', 'grid-cols-1');
    
    // 检查移动端图片画廊
    cy.get('[data-testid="product-gallery"]').should('be.visible');
    
    // 检查移动端操作按钮
    cy.get('[data-testid="mobile-actions"]').should('be.visible');
    
    // 测试移动端标签切换
    cy.get('[data-testid="tab-specs"]').click();
    cy.get('[data-testid="specs-content"]').should('be.visible');
  });

  it('should handle 360 degree view if available', () => {
    // 如果产品有360度图片，测试360度查看器
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="360-viewer"]').length > 0) {
        cy.get('[data-testid="360-viewer"]').should('be.visible');
        
        // 测试播放/暂停功能
        cy.get('[data-testid="360-play-button"]').click();
        cy.get('[data-testid="360-pause-button"]').should('be.visible');
        
        // 测试拖拽旋转
        cy.get('[data-testid="360-image"]')
          .trigger('mousedown', { clientX: 100, clientY: 100 })
          .trigger('mousemove', { clientX: 200, clientY: 100 })
          .trigger('mouseup');
      }
    });
  });

  it('should handle error states gracefully', () => {
    // 测试图片加载失败的情况
    cy.intercept('GET', '/images/products/**', { statusCode: 404 });
    cy.reload();
    
    // 应该显示默认图片或错误状态
    cy.get('[data-testid="image-error-fallback"]', { timeout: 10000 })
      .should('be.visible');
  });

  it('should track user interactions for analytics', () => {
    // 模拟分析事件跟踪
    cy.window().then((win) => {
      cy.stub(win, 'gtag').as('gtag');
    });
    
    // 触发各种用户交互
    cy.get('[data-testid="request-quote-button"]').click();
    cy.get('@gtag').should('have.been.calledWith', 'event', 'request_quote');
    
    cy.get('[data-testid="close-modal"]').click();
    
    cy.get('[data-testid="wishlist-button"]').click();
    cy.get('@gtag').should('have.been.calledWith', 'event', 'add_to_wishlist');
    
    cy.get('[data-testid="tab-specs"]').click();
    cy.get('@gtag').should('have.been.calledWith', 'event', 'view_specifications');
  });
});