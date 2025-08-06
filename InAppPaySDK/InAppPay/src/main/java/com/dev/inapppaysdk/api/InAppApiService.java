package com.dev.inapppaysdk.api;

import com.dev.inapppaysdk.api.models.ApiResponse;
import com.dev.inapppaysdk.api.models.PurchaseRequest;
import com.dev.inapppaysdk.api.models.ValidationRequest;

import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

/**
 * Retrofit API interface defining all endpoints used by the SDK.
 */
public interface InAppApiService {

    /**
     * Validates whether a user is eligible to purchase the item.
     */
    @POST("validateItemForPurchase")
    Call<Map<String, Object>> validateItemForPurchase(@Body Map<String, Object> request);

    /**
     * Processes the actual purchase after validation.
     */
    @POST("processPurchase")
    Call<Map<String, Object>> processPurchase(@Body Map<String, Object> request);

    /**
     * Checks if the user already purchased a specific item.
     */
    @POST("checkUserPurchased")
    Call<Map<String, Object>> checkUserPurchased(@Body Map<String, Object> request);

    /**
     * Checks if the user is subscribed to a specific subscription.
     */
    @POST("checkUserSubscribed")
    Call<Map<String, Object>> checkUserSubscribed(@Body Map<String, Object> request);

    /**
     * Retrieves all purchase records for the project.
     */
    @POST("getPurchases")
    Call<Map<String, Object>> getPurchases(@Body Map<String, Object> requestData);

    /**
     * Retrieves all subscription records for the project.
     */
    @POST("getSubscriptions")
    Call<Map<String, Object>> getSubscriptions(@Body Map<String, Object> requestData);
}
