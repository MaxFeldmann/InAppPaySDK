import React, { useState } from 'react';
import './InAppSDKDoc.css';

const InAppSDKDoc = () => {
  const [activeTabs, setActiveTabs] = useState({
    validate: 'validate-request',
    purchase: 'purchase-request',
    checkpurchased: 'checkpurchased-request',
    checksubscribed: 'checksubscribed-request',
    getpurchases: 'getpurchases-request',
    getsubscriptions: 'getsubscriptions-request',
    addproduct: 'addproduct-request',
    deleteproduct: 'deleteproduct-request',
    updateproduct: 'updateproduct-request',
    getproducts: 'getproducts-request',
    getanalytics: 'getanalytics-request',
    initializeproject: 'initializeproject-request',
    customerrors: 'custom-errors',
  });

  const showTab = (section, tabId) => {
    setActiveTabs(prev => ({
      ...prev,
      [section]: tabId
    }));
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const TabButton = ({ section, tabId, label, isActive, onClick }) => (
    <button
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  const TabContent = ({ section, tabId, isActive, children }) => (
    <div className={`tab-content ${isActive ? 'active' : ''}`}>
      {children}
    </div>
  );

  const CodeBlock = ({ children }) => (
    <div className="code-block">
      <pre>{children}</pre>
    </div>
  );

  const ResponseExample = ({ type, title, children }) => (
    <div className={`response-example ${type || ''}`}>
      <strong>{title}</strong>
      {children}
    </div>
  );

  const ParamsTable = ({ params }) => (
    <table className="params-table">
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Type</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {params.map((param, index) => (
          <tr key={index}>
            <td className="param-name">{param.name}</td>
            <td>{param.type}</td>
            <td>
              <span className={param.required ? 'param-required' : 'param-optional'}>
                {param.required ? 'Required' : 'Optional'}
              </span>
            </td>
            <td>{param.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const Endpoint = ({ id, title, method, url, description, section, requestParams, successResponse, errorResponse, javaExample, additionalResponse }) => (
    <div className="endpoint" id={id}>
      <h3 className="endpoint-title">{title}</h3>
      <div className="endpoint-method">
        <span className="method-badge">{method}</span>
        <span className="endpoint-url">{url}</span>
      </div>
      <div className="endpoint-description">{description}</div>

      <div className="tab-container">
        <TabButton section={section} tabId={`${section}-request`} label="Request" isActive={activeTabs[section] === `${section}-request`} onClick={() => showTab(section, `${section}-request`)} />
        <TabButton section={section} tabId={`${section}-response`} label="Response" isActive={activeTabs[section] === `${section}-response`} onClick={() => showTab(section, `${section}-response`)} />
        <TabButton section={section} tabId={`${section}-example`} label="Example" isActive={activeTabs[section] === `${section}-example`} onClick={() => showTab(section, `${section}-example`)} />
      </div>

      <TabContent section={section} tabId={`${section}-request`} isActive={activeTabs[section] === `${section}-request`}>
        <h4>Request Parameters</h4>
        <ParamsTable params={requestParams} />
      </TabContent>

      <TabContent section={section} tabId={`${section}-response`} isActive={activeTabs[section] === `${section}-response`}>
        <h4>Response Format</h4>
        <ResponseExample type="success" title="Success Response (200 OK):">
          <CodeBlock>{successResponse}</CodeBlock>
        </ResponseExample>

        {additionalResponse && (
          <ResponseExample title={additionalResponse.title}>
            <CodeBlock>{additionalResponse.content}</CodeBlock>
          </ResponseExample>
        )}

        {errorResponse && (
          <ResponseExample type="error" title="Error Response (400/403/500):">
            <CodeBlock>{errorResponse}</CodeBlock>
          </ResponseExample>
        )}
      </TabContent>

      <TabContent section={section} tabId={`${section}-example`} isActive={activeTabs[section] === `${section}-example`}>
        <h4>Java Example</h4>
        <CodeBlock>{javaExample}</CodeBlock>
      </TabContent>
    </div>
  );

  return (
    <div className="container">
      <div className="main-content">

        {/* Header */}
        <header className="header">
          <h1>In-App Payment SDK API</h1>
          <p>Complete API documentation for Firebase Cloud Functions endpoints</p>
        </header>

        {/* Base URL */}
        <div className="base-url">
          <strong>Base URL:</strong> https://us-central1-inapppay-47111.cloudfunctions.net
        </div>

        {/* Table of Contents */}
        <div className="card-small toc">
          <h2>Table of Contents</h2>
          <ul>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'getting-started', label: 'Getting Started' },
              { id: 'initialize-project', label: 'Initialize Project' },
              { id: 'get-products', label: 'Get Products' },
              { id: 'add-product', label: 'Add Product' },
              { id: 'delete-product', label: 'Delete Product' },
              { id: 'update-product', label: 'Update Product' },
              { id: 'get-purchases', label: 'Get Purchases' },
              { id: 'get-analytics', label: 'Get Project Analytics' },
              { id: 'validate-item', label: 'Validate Item for Purchase' },
              { id: 'process-purchase', label: 'Process Purchase' },
              { id: 'check-purchased', label: 'Check User Purchased' },
              { id: 'check-subscribed', label: 'Check User Subscribed' },
              { id: 'get-subscriptions', label: 'Get Subscriptions' },
              { id: 'error-handling', label: 'Error Handling' }
            ].map(item => (
              <li key={item.id}>
                <button onClick={() => scrollToSection(item.id)} className="toc-link">
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections from JSX Partials */}
        
        {/* Overview Section */}
        <div id="overview" className="card">
          <h2 className="section-header">Overview</h2>
          <p>The In-App Payment SDK API provides a comprehensive set of endpoints for managing in-app purchases and subscriptions. All endpoints are hosted on Firebase Cloud Functions and accept JSON payloads via POST requests.</p>
          
          <div className="alert">
            <strong>Note:</strong> All API calls require proper authentication and return standardized response formats with success/error indicators.
          </div>
        </div>

        {/* Getting Started Section */}
        <div id="getting-started" className="card">
  <h2 className="section-header">Getting Started</h2>
  <p>
    To begin using the API, you first need to initialize your project. There are two ways to do this:
  </p>

  <ul>
    <li>
      <strong>Option 1 (API-first):</strong> Call the <code>/initializeProject</code> endpoint directly from your backend or client to register your <em>project name</em>.
    </li>
    <li>
      <strong>Option 2 (Web-first):</strong> Visit the dashboard website and enter your project name on the landing page. This will automatically create the project entry in the backend.
    </li>
  </ul>

  <div className="alert">
    <strong>Once your project is initialized:</strong>
    <ul>
      <li>You can add products (one-time, subscriptions, or repurchases).</li>
      <li>You can start making and tracking purchases using the mobile SDK or dashboard.</li>
    </ul>
  </div>
  <p className="note">
  <strong>Note:</strong> Most API calls require your <code>projectName</code> as a request parameter. This is how the backend associates requests with your data. You do not need authentication keys or tokens.
  </p>
</div>

        {/*Initialize Project Endpoint */}
        <div id="initialize-project" className="card">
  <Endpoint
    id="initialize-project"
    title="Initialize Project"
    method="POST"
    url="/initializeProject"
    description="Registers a new Firebase project in the backend system. Called when a user enters a project name for the first time."
    section="initializeproject"
    requestParams={[
      { name: 'projectName', type: 'String', required: true, description: 'A unique identifier for the project. Must not contain . # $ [ ] /' }
    ]}
    successResponse={`{
  "success": true,
  "message": "Project initialized"
}`}
    errorResponse={`{
  "success": false,
  "error": "Project name already exists"
}`}
    javaExample={`// JS fetch example
fetch(\`\${FUNCTIONS}/initializeProject\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectName: "MyCoolApp" })
});`}
  />
</div>


        {/*Get Products Endpoint */}
        <div id="get-products" className="card">
  <Endpoint
    id="get-products"
    title="Get Products"
    method="POST"
    url="/getProducts"
    description="Fetches all products associated with a specific project. Used for listing products in the dashboard."
    section="getproducts"
    requestParams={[
      { name: 'projectName', type: 'String', required: true, description: 'The name of your Firebase project' }
    ]}
    successResponse={`{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "Premium Plan",
      "price": 499,
      "type": "subscription",
      "status": "active"
    }
  ]
}`}
    errorResponse={`{
  "success": false,
  "error": "Project not found"
}`}
    javaExample={`// fetch example
fetch(\`\${FUNCTIONS}/getProducts\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectName: "MyProject" })
});`}
  />
</div>

        {/*Add Product Endpoint */}
        <div id="add-product" className="card">
  <Endpoint
    id="add-product"
    title="Add Product"
    method="POST"
    url="/addProduct"
    description="Adds a new product to your Firebase project. Products can be subscriptions, one-time purchases, or repurchases."
    section="addproduct"
    requestParams={[
      { name: 'projectName', type: 'String', required: true, description: 'The project to add the product under' },
      { name: 'name', type: 'String', required: true, description: 'Display name of the product' },
      { name: 'price', type: 'Number', required: true, description: 'Price in cents (e.g., 499 = $4.99)' },
      { name: 'type', type: 'String', required: true, description: 'Product type: subscription, one-time, or repurchase' },
      { name: 'description', type: 'String', required: false, description: 'Optional description of the product' },
      { name: 'frequency', type: 'String', required: false, description: 'If subscription, how often it recurs (monthly/yearly)' },
      { name: 'recurring', type: 'Boolean', required: false, description: 'Whether the subscription auto-renews' }
    ]}
    successResponse={`{
  "success": true,
  "message": "Product added successfully",
  "productId": "prod_001"
}`}
    errorResponse={`{
  "success": false,
  "error": "Validation failed"
}`}
    javaExample={`// fetch example
fetch(\`\${FUNCTIONS}/addProduct\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: "MyProject",
    name: "Gold Plan",
    price: 499,
    type: "subscription",
    frequency: "monthly",
    recurring: true
  })
});`}
  />
</div>

      {/*Delete Product Endpoint */}
      <div id="delete-product" className="card">
  <Endpoint
    id="delete-product"
    title="Delete Product"
    method="POST"
    url="/deleteProduct"
    description="Deletes a product by ID from the Firebase project."
    section="deleteproduct"
    requestParams={[
      { name: 'projectName', type: 'String', required: true, description: 'Your project name' },
      { name: 'productId', type: 'String', required: true, description: 'ID of the product to delete' }
    ]}
    successResponse={`{
  "success": true,
  "message": "Product deleted"
}`}
    errorResponse={`{
  "success": false,
  "error": "Product not found"
}`}
    javaExample={`fetch(\`\${FUNCTIONS}/deleteProduct\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectName: "MyProject", productId: "prod_001" })
});`}
  />
</div>

        {/*Update Product Endpoint */}
        <div id="update-product" className="card">
  <Endpoint
    id="update-product"
    title="Update Product"
    method="POST"
    url="/updateProduct"
    description="Updates a product's fields (e.g., status, name, price). Useful for toggling activation or editing details."
    section="updateproduct"
    requestParams={[
      { name: 'projectName', type: 'String', required: true, description: 'Project identifier' },
      { name: 'productId', type: 'String', required: true, description: 'The product ID to update' },
      { name: 'updates', type: 'Object', required: true, description: 'Key-value map of fields to update' }
    ]}
    successResponse={`{
  "success": true,
  "message": "Product updated"
}`}
    errorResponse={`{
  "success": false,
  "error": "Invalid product ID"
}`}
    javaExample={`fetch(\`\${FUNCTIONS}/updateProduct\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: "MyProject",
    productId: "prod_001",
    updates: { status: "inactive" }
  })
});`}
  />
</div>

        {/*Get Purchases Endpoint */}
        <div id="get-purchases" className="card">
  <Endpoint
    id="get-purchases"
    title="Get Purchases"
    method="POST"
    url="/getPurchases"
    description="Retrieves purchase records for your Firebase project. Can be filtered by user or used to fetch all purchases (e.g., for dashboards)."
    section="getpurchases"
    requestParams={[
      { name: 'projectName', type: 'String', required: true, description: 'The name of your Firebase project' },
      { name: 'userId', type: 'String', required: false, description: 'Optional: Filter purchases by specific user ID' },
      { name: 'itemId', type: 'String', required: false, description: 'Optional: Filter by product ID' },
      { name: 'limit', type: 'Number', required: false, description: 'Optional: Max number of records to return' },
      { name: 'offset', type: 'Number', required: false, description: 'Optional: Number of records to skip' }
    ]}
    successResponse={`{
  "success": true,
  "purchases": [
    {
      "purchaseId": "purchase_xyz789",
      "userId": "user123",
      "productId": "gold_plan",
      "amount": 9.99,
      "currency": "USD",
      "status": "completed",
      "paymentMethod": "card",
      "purchaseDate": "2025-07-09T10:30:00Z",
      "country": "US"
    }
  ],
  "totalCount": 1,
  "hasMore": false
}`}
    errorResponse={`{
  "success": false,
  "error": "Invalid request"
}`}
    javaExample={`// Example: fetch user-specific purchases
fetch(\`\${FUNCTIONS}/getPurchases\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: "MyProject",
    userId: "user123"
  })
});

// Example: fetch all purchases (dashboard)
fetch(\`\${FUNCTIONS}/getPurchases\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: "MyProject"
  })
});`}
  />
</div>

        {/* Get Analytics Endpoint */}
        <div id="get-analytics" className="card">
  <Endpoint
    id="get-analytics"
    title="Get Project Analytics"
    method="POST"
    url="/getProjectAnalytics"
    description="Returns revenue breakdowns and purchase metrics for a given time period. Useful for charts and summaries."
    section="getanalytics"
    requestParams={[
      { name: 'projectName', type: 'String', required: true, description: 'Firebase project name' },
      { name: 'startDate', type: 'String', required: false, description: 'Start of the time range (YYYY-MM-DD)' },
      { name: 'endDate', type: 'String', required: false, description: 'End of the time range (YYYY-MM-DD)' }
    ]}
    successResponse={`{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 12345.67,
      "totalPurchases": 234,
      "activeSubscriptions": 45,
      "averageOrderValue": 52.75
    },
    "breakdown": {
      "revenueByCountry": { "US": 5000, "UK": 3000 },
      "revenueByPaymentMethod": { "card": 6000, "paypal": 2000 },
      "productRevenue": { "gold_plan": 4500, "silver_plan": 2500 }
    },
    "purchases": [ ... ],
    "dateRange": {
      "startDate": "2025-06-01",
      "endDate": "2025-07-01",
      "filteredPurchases": 123
    }
  }
}`}
    errorResponse={`{
  "success": false,
  "error": "Analytics unavailable"
}`}
    javaExample={`fetch(\`\${FUNCTIONS}/getProjectAnalytics\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: "MyProject",
    startDate: "2025-06-01",
    endDate: "2025-07-01"
  })
});`}
  />
</div>

        {/* Validate Item Endpoint */}
        <div id="validate-item" className="card">
          <Endpoint
            id="validate-item"
            title="Validate Item for Purchase"
            method="POST"
            url="/validateItemForPurchase"
            description="Validates whether a user is eligible to purchase a specific item. This endpoint checks user permissions, item availability, and purchase eligibility."
            section="validate"
            requestParams={[
              { name: 'userId', type: 'String', required: true, description: 'Unique identifier for the user' },
              { name: 'itemId', type: 'String', required: true, description: 'Identifier of the item to validate' },
              { name: 'projectId', type: 'String', required: true, description: 'Your project identifier' },
            ]}
            successResponse={`{
  "success": true,
  "eligible": true,
  "message": "User is eligible to purchase this item",
  "itemDetails": {
    "id": "item123",
    "name": "Premium Feature",
    "price": 9.99,
    "currency": "USD"
  }
}`}
            errorResponse={`{
  "success": false,
  "eligible": false,
  "message": "User already owns this item",
  "errorCode": "ALREADY_PURCHASED"
}`}
            javaExample={`Map<String, Object> request = new HashMap<>();
request.put("userId", "user123");
request.put("itemId", "premium_feature");
request.put("projectId", "your-project-id");

Call<Map<String, Object>> call = ApiClient.getApiService()
    .validateItemForPurchase(request);

call.enqueue(new Callback<Map<String, Object>>() {
    @Override
    public void onResponse(Call<Map<String, Object>> call, 
                          Response<Map<String, Object>> response) {
        if (response.isSuccessful()) {
            Map<String, Object> result = response.body();
            boolean eligible = (boolean) result.get("eligible");
            // Handle validation result
        }
    }

    @Override
    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
        // Handle error
    }
});`}
          />
        </div>

        {/* Process Purchase Endpoint */}
        <div id="process-purchase" className="card">
          <Endpoint
            id="process-purchase"
            title="Process Purchase"
            method="POST"
            url="/processPurchase"
            description="Processes the actual purchase after validation. This endpoint handles the complete purchase flow including payment processing and record creation."
            section="purchase"
            requestParams={[
              { name: 'userId', type: 'String', required: true, description: 'Unique identifier for the user' },
              { name: 'itemId', type: 'String', required: true, description: 'Identifier of the item to purchase' },
              { name: 'paymentToken', type: 'String', required: true, description: 'Payment token from the client' },
              { name: 'amount', type: 'Number', required: true, description: 'Purchase amount' },
              { name: 'currency', type: 'String', required: true, description: 'Currency code (e.g., "USD")' },
              { name: 'projectId', type: 'String', required: true, description: 'Your project identifier' },
            ]}
            successResponse={`{
  "success": true,
  "transactionId": "txn_abc123",
  "purchaseId": "purchase_xyz789",
  "message": "Purchase completed successfully",
  "purchaseDetails": {
    "itemId": "premium_feature",
    "amount": 9.99,
    "currency": "USD",
    "purchaseDate": "2025-07-09T10:30:00Z"
  }
}`}
            errorResponse={`{
  "success": false,
  "message": "Payment failed",
  "errorCode": "PAYMENT_DECLINED",
  "details": "Insufficient funds"
}`}
            javaExample={`Map<String, Object> request = new HashMap<>();
request.put("userId", "user123");
request.put("itemId", "premium_feature");
request.put("paymentToken", "tok_visa_1234");
request.put("amount", 9.99);
request.put("currency", "USD");
request.put("projectId", "your-project-id");

Call<Map<String, Object>> call = ApiClient.getApiService()
    .processPurchase(request);

call.enqueue(new Callback<Map<String, Object>>() {
    @Override
    public void onResponse(Call<Map<String, Object>> call, 
                          Response<Map<String, Object>> response) {
        if (response.isSuccessful()) {
            Map<String, Object> result = response.body();
            String transactionId = (String) result.get("transactionId");
            // Handle successful purchase
        }
    }

    @Override
    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
        // Handle error
    }
});`}
          />
        </div>

        {/* Check User Purchased Endpoint */}
        <div id="check-purchased" className="card">
          <Endpoint
            id="check-purchased"
            title="Check User Purchased"
            method="POST"
            url="/checkUserPurchased"
            description="Checks if a user has already purchased a specific item. Useful for validating access to premium features."
            section="checkpurchased"
            requestParams={[
              { name: 'userId', type: 'String', required: true, description: 'Unique identifier for the user' },
              { name: 'itemId', type: 'String', required: true, description: 'Identifier of the item to check' },
              { name: 'projectId', type: 'String', required: true, description: 'Your project identifier' },
            ]}
            successResponse={`{
  "success": true,
  "purchased": true,
  "purchaseDetails": {
    "purchaseId": "purchase_xyz789",
    "purchaseDate": "2025-07-09T10:30:00Z",
    "transactionId": "txn_abc123"
  }
}`}
            additionalResponse={{
              title: "Not Purchased Response (200 OK):",
              content: `{
  "success": true,
  "purchased": false,
  "message": "User has not purchased this item"
}`
            }}
            javaExample={`Map<String, Object> request = new HashMap<>();
request.put("userId", "user123");
request.put("itemId", "premium_feature");
request.put("projectId", "your-project-id");

Call<Map<String, Object>> call = ApiClient.getApiService()
    .checkUserPurchased(request);

call.enqueue(new Callback<Map<String, Object>>() {
    @Override
    public void onResponse(Call<Map<String, Object>> call, 
                          Response<Map<String, Object>> response) {
        if (response.isSuccessful()) {
            Map<String, Object> result = response.body();
            boolean purchased = (boolean) result.get("purchased");
            // Handle purchase status
        }
    }

    @Override
    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
        // Handle error
    }
});`}
          />
        </div>

        {/* Check User Subscribed Endpoint */}
        <div id="check-subscribed" className="card">
          <Endpoint
            id="check-subscribed"
            title="Check User Subscribed"
            method="POST"
            url="/checkUserSubscribed"
            description="Checks if a user has an active subscription to a specific subscription service."
            section="checksubscribed"
            requestParams={[
              { name: 'userId', type: 'String', required: true, description: 'Unique identifier for the user' },
              { name: 'subscriptionId', type: 'String', required: true, description: 'Identifier of the subscription to check' },
              { name: 'projectId', type: 'String', required: true, description: 'Your project identifier' },
            ]}
            successResponse={`{
  "success": true,
  "subscribed": true,
  "subscriptionDetails": {
    "subscriptionId": "sub_premium_monthly",
    "status": "active",
    "startDate": "2025-06-09T10:30:00Z",
    "endDate": "2025-08-09T10:30:00Z",
    "renewalDate": "2025-08-09T10:30:00Z"
  }
}`}
            additionalResponse={{
              title: "Not Subscribed Response (200 OK):",
              content: `{
  "success": true,
  "subscribed": false,
  "message": "User does not have an active subscription"
}`
            }}
            javaExample={`Map<String, Object> request = new HashMap<>();
request.put("userId", "user123");
request.put("subscriptionId", "premium_monthly");
request.put("projectId", "your-project-id");

Call<Map<String, Object>> call = ApiClient.getApiService()
    .checkUserSubscribed(request);

call.enqueue(new Callback<Map<String, Object>>() {
    @Override
    public void onResponse(Call<Map<String, Object>> call, 
                          Response<Map<String, Object>> response) {
        if (response.isSuccessful()) {
            Map<String, Object> result = response.body();
            boolean subscribed = (boolean) result.get("subscribed");
            // Handle subscription status
        }
    }

    @Override
    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
        // Handle error
    }
});`}
          />
        </div>

        {/* Get Subscriptions Endpoint */}
        <div id="get-subscriptions" className="card">
          <Endpoint
            id="get-subscriptions"
            title="Get Subscriptions"
            method="POST"
            url="/getSubscriptions"
            description="Retrieves all subscription records for the project. Supports filtering and pagination."
            section="getsubscriptions"
            requestParams={[
              { name: 'projectId', type: 'String', required: true, description: 'Your project identifier' },
              { name: 'userId', type: 'String', required: false, description: 'Filter by specific user' },
              { name: 'subscriptionId', type: 'String', required: false, description: 'Filter by specific subscription' },
              { name: 'status', type: 'String', required: false, description: 'Filter by subscription status (active, cancelled, expired)' },
              { name: 'limit', type: 'Number', required: false, description: 'Maximum number of records to return' },
              { name: 'offset', type: 'Number', required: false, description: 'Number of records to skip' }
            ]}
            successResponse={`{
  "success": true,
  "subscriptions": [
    {
      "subscriptionId": "sub_premium_monthly",
      "userId": "user123",
      "status": "active",
      "startDate": "2025-06-09T10:30:00Z",
      "endDate": "2025-08-09T10:30:00Z",
      "renewalDate": "2025-08-09T10:30:00Z",
      "amount": 9.99,
      "currency": "USD"
    }
  ],
  "totalCount": 1,
  "hasMore": false
}`}
            errorResponse={`{
  "success": false,
  "message": "Access denied",
  "errorCode": "UNAUTHORIZED"
}`}
            javaExample={`Map<String, Object> request = new HashMap<>();
request.put("projectId", "your-project-id");
request.put("status", "active"); // Optional filter
request.put("limit", 10); // Optional pagination

Call<Map<String, Object>> call = ApiClient.getApiService()
    .getSubscriptions(request);

call.enqueue(new Callback<Map<String, Object>>() {
    @Override
    public void onResponse(Call<Map<String, Object>> call, 
                          Response<Map<String, Object>> response) {
        if (response.isSuccessful()) {
            Map<String, Object> result = response.body();
            List<Map<String, Object>> subscriptions = 
                (List<Map<String, Object>>) result.get("subscriptions");
            // Handle subscriptions list
        }
    }

    @Override
    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
        // Handle error
    }
});`}
          />
        </div>

        {/* Error Handling */}
        <div id="error-handling" className="card error-section">
          <h2 className="section-header">Error Handling</h2>
          <p>All API endpoints return standardized error responses with appropriate HTTP status codes and error details.</p>

          <h3>Common Error Codes</h3>

          <div className="error-card error-400">
            <h4>400 Bad Request</h4>
            <p>Invalid request parameters or missing required fields</p>
            <CodeBlock>{`{
  "success": false,
  "message": "Missing required parameter: userId",
  "errorCode": "MISSING_PARAMETER"
}`}</CodeBlock>
          </div>

          <div className="error-card error-401">
            <h4>401 Unauthorized</h4>
            <p>Invalid API key or project ID</p>
            <CodeBlock>{`{
  "success": false,
  "message": "Invalid API key",
  "errorCode": "UNAUTHORIZED"
}`}</CodeBlock>
          </div>

          <div className="error-card error-403">
            <h4>403 Forbidden</h4>
            <p>Access denied to the requested resource</p>
            <CodeBlock>{`{
  "success": false,
  "message": "Access denied",
  "errorCode": "FORBIDDEN"
}`}</CodeBlock>
          </div>

          <div className="error-card error-500">
            <h4>500 Internal Server Error</h4>
            <p>Server-side error occurred</p>
            <CodeBlock>{`{
  "success": false,
  "message": "Internal server error",
  "errorCode": "INTERNAL_ERROR"
}`}</CodeBlock>
          </div>
        </div>

        {/* Custom Error Section */}
        <div id="custom-errors" className="card error-section">
          <h2 className="section-header">Custom Error Codes</h2>
          <p>These error codes are returned from API endpoints to help developers handle common issues gracefully.</p>

          <div className="error-card error-400">
            <h4>400 BAD REQUEST</h4>
            <p><code>INVALID_PROJECT_NAME</code> – Project name is malformed or contains illegal characters.</p>
          </div>
          <div className="error-card error-400">
            <h4>400 BAD REQUEST</h4>
            <p><code>PROJECT_EXISTS</code> – A project with the same name already exists.</p>
          </div>
          <div className="error-card error-404">
            <h4>404 NOT FOUND</h4>
            <p><code>PROJECT_NOT_FOUND</code> – The specified project name does not exist in the database.</p>
          </div>
          <div className="error-card error-404">
            <h4>404 NOT FOUND</h4>
            <p><code>PRODUCT_NOT_FOUND</code> – The product ID was not found or has been deleted.</p>
          </div>
          <div className="error-card error-400">
            <h4>400 BAD REQUEST</h4>
            <p><code>INVALID_PRODUCT_ID</code> – The product ID is missing or invalid.</p>
          </div>
          <div className="error-card error-400">
            <h4>400 BAD REQUEST</h4>
            <p><code>INVALID_ITEM_TYPE</code> – Product type must be one of <code>subscription</code>, <code>one-time</code>, or <code>repurchase</code>.</p>
          </div>
          <div className="error-card error-400">
            <h4>400 BAD REQUEST</h4>
            <p><code>INVALID_PURCHASE_DATA</code> – Missing or malformed payment data during purchase.</p>
          </div>
          <div className="error-card error-400">
            <h4>400 BAD REQUEST</h4>
            <p><code>INVALID_CARD_INFO</code> – The provided card details are not valid.</p>
          </div>
          <div className="error-card error-409">
            <h4>409 CONFLICT</h4>
            <p><code>ALREADY_PURCHASED</code> – User already owns this one-time or repurchasable item.</p>
          </div>
          <div className="error-card error-409">
            <h4>409 CONFLICT</h4>
            <p><code>ALREADY_SUBSCRIBED</code> – User is already subscribed to this plan.</p>
          </div>
          <div className="error-card error-404">
            <h4>404 NOT FOUND</h4>
            <p><code>NOT_SUBSCRIBED</code> – No active subscription found for the user.</p>
          </div>
          <div className="error-card error-404">
            <h4>404 NOT FOUND</h4>
            <p><code>NOT_PURCHASED</code> – User has not previously purchased this item.</p>
          </div>
          <div className="error-card error-499">
            <h4>499 CLIENT CLOSED REQUEST</h4>
            <p><code>PURCHASE_CANCELLED</code> – User closed the dialog or canceled the transaction.</p>
          </div>
          <div className="error-card error-500">
            <h4>500 INTERNAL SERVER ERROR</h4>
            <p><code>PURCHASE_FAILED</code> – The payment process failed on the server side.</p>
          </div>
          <div className="error-card error-500">
            <h4>500 INTERNAL SERVER ERROR</h4>
            <p><code>VALIDATION_FAILED</code> – The item could not be validated for purchase.</p>
          </div>
          <div className="error-card error-503">
            <h4>503 SERVICE UNAVAILABLE</h4>
            <p><code>NETWORK_ERROR</code> – The client failed to connect to the server.</p>
          </div>
          <div className="error-card error-422">
            <h4>422 UNPROCESSABLE ENTITY</h4>
            <p><code>ERROR_PARSE_FAILED</code> – The client couldn't parse the error response.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InAppSDKDoc;
