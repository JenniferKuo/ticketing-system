# Ticketing System

## System Requirements
- Users can register and login
- Users can view available events and their available tickets
- Users can buy tickets for an event
- Users can confirm or cancel an order
- Users can view their order history
- If a user cancels an order, the tickets should be released and the inventory should be updated

## Non-functional requirements
- Prevent over-selling tickets
- Low latency for ticket purchase (< 100ms)
- High concurrency for ticket purchase (5000 QPS)
- High availability for ticket purchase (99.99% uptime)
- Easy to deploy and scale

## System Architecture

1. 核心服務拆分
搶票核心服務:
    Node.js
    ├── Auth Service
    │   └── 用戶認證
    │
    ├── Ticket Service (核心)
    │   ├── 票券庫存管理
    │   ├── 搶票邏輯
    │   └── 防超賣機制
    │
    └── Order Service
        ├── 訂單處理
        └── 付款狀態管理

2. 資料儲存層
儲存架構：
    ├── PostgreSQL
    │   ├── 用戶資料
    │   ├── 票券資料
    │   └── 訂單資料
    │
    ├── Redis Cluster
    │   ├── 票券庫存快取
    │   ├── 用戶限制記錄
    │   └── 訂單暫存
    │
    └── Kafka
        ├── 訂單異步處理
        └── 庫存更新事件

3. 核心流程設計
搶票流程：
    1. 用戶請求
    ├── 身份驗證
    └── 限流檢查

    2. 庫存確認
    ├── Redis 庫存檢查
    └── 用戶限制檢查

    3. 票券鎖定
    ├── Redis 預扣庫存
    └── 建立暫存訂單

    4. 訂單處理
    ├── PostgreSQL 訂單創建
    ├── 實際扣減庫存
    └── Kafka 訂單消息

4. K8s 部署架構
Kubernetes 配置：
    ├── Ticket Service
    │   ├── 最小 3 個副本
    │   └── 自動擴展至 10 個
    │
    ├── Redis Cluster
    │   ├── 3 主 3 從
    │   └── 故障自動轉移
    │
    └── PostgreSQL
        ├── 1 主 2 從
        └── 讀寫分離
5. 高可用設計
可用性保證：
    ├── 服務冗餘
    │   └── 多副本部署
    │
    ├── 資料冗餘
    │   ├── Redis 主從複製
    │   └── PostgreSQL 主從架構
    │
    └── 故障轉移
        ├── 服務自動恢復
        └── 資料庫自動切換
6. 效能優化
    性能保證：
    ├── 快取策略
    │   ├── 票券庫存快取
    │   └── 熱門場次預熱
    │
    ├── 資料庫優化
    │   ├── 讀寫分離
    │   └── 索引優化
    │
    └── 限流措施
        ├── 全局限流
        └── 用戶級限流

## API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | User Registration |
| POST | `/users/login` | User Login (Returns JWT) |
| GET | `/events` | Get Event Information |
| GET | `/events/{event_id}/tickets` | Get Ticket Information |
| POST | `/orders/create` | Create Order (Pre-reserve Inventory) |
| POST | `/orders/{order_id}/confirm` | Confirm Order (Payment + Final Inventory Deduction) |
| POST | `/orders/{order_id}/cancel` | Cancel Order (Release Inventory) |
| GET | `/orders/{user_id}` | Query User Orders |