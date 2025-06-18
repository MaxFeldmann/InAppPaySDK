package com.dev.inapppaysdk.api;

import com.dev.inapppaysdk.api.models.ApiResponse;
import com.dev.inapppaysdk.api.models.PurchaseRequest;
import com.dev.inapppaysdk.api.models.ValidationRequest;

import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface InAppApiService {

    @POST("validateItemForPurchase")
    Call<Map<String, Object>> validateItemForPurchase(@Body Map<String, Object> request);

    @POST("processPurchase")
    Call<Map<String, Object>> processPurchase(@Body Map<String, Object> request);

    @POST("checkUserPurchased")
    Call<Map<String, Object>> checkUserPurchased(@Body Map<String, Object> request);

    @POST("checkUserSubscribed")
    Call<Map<String, Object>> checkUserSubscribed(@Body Map<String, Object> request);

    @POST("getPurchases")
    Call<Map<String, Object>> getPurchases(@Body Map<String, Object> requestData);
}
