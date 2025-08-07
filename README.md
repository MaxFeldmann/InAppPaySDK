# 🛒 Android In-App Payment SDK & Developer Dashboard

A complete in-app monetization platform for Android apps — built with a modular Java SDK, Firebase backend, and a powerful React web console.

## Table of Contents

- [Overview](#overview)
- [Features](#key-features)
- [Demo Video](#demo-video)
- [Developer Flow](#developer-flow)
- [Screenshots](#screenshots)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)

## 🔍 Overview

This project enables Android developers to fully control their in-app purchase flows without relying on third-party stores like Google Play. It includes:

-  **Android SDK (Java)** for handling in-app purchases via **credit card** and **PayPal**
-  **Firebase Cloud Functions** for backend logic and API integrations
-  **React Web Console** to manage products, monitor transactions, and view analytics

## 💡 Key Features

- 📦 Product validation and dynamic purchase handling
- 👤 Ownership checks and subscription history retrieval
- 📊 Developer dashboard for:
  - Adding, updating, and deleting in-app products
  - Tracking purchase history
  - Viewing transaction analytics
- 🔗 REST API endpoints for customizable workflows and integrations
- 🔄 Scalable architecture designed for flexibility and easy integration

---

## 🎥 Demo Video
  

[![Watch the Demo](https://i.ibb.co/kg6LKyfB/thumbnail.jpg)](https://youtu.be/A_-fc9HH7cc)

Click the image above to watch a quick demonstration of how to use the SDK in your app.

---

## 🔄 Developer Flow

1. **Start in the Developer Console**  
   - Visit the [web dashboard](https://inapppaysdk.web.app/).
   - Create a new project.
   - Add in-app products to offer within your Android app.
   - View purchase history and transaction analytics.

2. **Import the SDK into Your Android App**  
   - Add the SDK to your `build.gradle` using JitPack:
     ```groovy
     allprojects {
         repositories {
             maven { url 'https://jitpack.io' }
         }
     }

     dependencies {
         implementation 'com.github.your-username:InAppPaySDK:v1.3.0'
     }
     ```

3. **Use the SDK in Your App**

   Here's how to integrate `InAppPaySDK.java` in your app:

   - **Initialize the SDK**
     ```java
     InAppPaySDK sdk = new InAppPaySDK(
        context,
        "your_project_id",  // Must match the project ID used in the console
        new PurchaseCallback() {
            @Override
            public void onSuccess(String message) {
                // Handle successful purchase
                Toast.makeText(context, "Success: " + message, Toast.LENGTH_SHORT).show();
            }
    
            @Override
            public void onError(String error) {
                // Handle failure
                Toast.makeText(context, "Error: " + error, Toast.LENGTH_SHORT).show();
            }
        }
      );
     ```

   - **Trigger a Purchase Flow**
     When you want the purchase flow to start use the buy function.
     ```java
      sdk.buy("premium_01", new PurchaseCallback() {
       @Override
       public  void onSuccess(String msg, Map<String,Object> data) {  … }
      
       @Override public  void onError(String err, String code) {  … }
       } );
       }
     ```

---

## 📸 Screenshots

<div align="left">
  
 ### Home Page
  <img src="https://i.ibb.co/k24RZVQd/landing.jpg" alt="Home Page" width="600"/>

  <br/><br/>
 ### Earnings Example
  <img src="https://i.ibb.co/kgBrGfWV/earnings.jpg" alt="Earnings Example" width="600"/>

  <br/><br/>
  ### Earnings Pie Example
  <img src="https://i.ibb.co/fVL6x9qj/pie.jpg" alt="Earnings Pie Example" width="600"/>

  <br/><br/>
 ### Products Example
  <img src="https://i.ibb.co/C5Xhq06X/products.jpg" alt="Products Example" width="600"/>

  <br/><br/>
  ### Purchases Example
  <img src="https://i.ibb.co/GBKFdMq/purchases.jpg" alt="Purchases Example" width="600"/>

  <br/><br/>
  ### Purchasing Example
  <img src="https://i.ibb.co/jkDvCP5V/purchasecard.jpg" alt="Purchasing Example" width="600"/>

  <br/><br/>
  ### Purchase Input Example
  <img src="https://i.ibb.co/ymZsNVB1/purchasestart.jpg" alt="Purchase Input Example" width="600"/>

  <br/><br/>
  ### Purchase Error Example
  <img src="https://i.ibb.co/pBGCsYbt/purchaseerror.jpg" alt="Purchase Error Example" width="600"/>

  <br/><br/>

</div>

---

## 📚 Documentation

  - 📘 Java SDK Docs: [Java-doc](https://inapppaysdk.web.app/java-doc)
  
  - 🔌 API Reference: [API-doc](https://inapppaysdk.web.app/doc)


---

## 🛠 Tech Stack

  Mobile SDK: Java (Android)
  
  Backend: Firebase Cloud Functions & Firestore
  
  Frontend Console: React (JavaScript && CSS)
  

