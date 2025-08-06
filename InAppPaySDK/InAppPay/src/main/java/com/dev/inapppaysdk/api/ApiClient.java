package com.dev.inapppaysdk.api;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import java.util.concurrent.TimeUnit;

/**
 * Singleton Retrofit API client for communicating with Firebase Cloud Functions.
 */
public class ApiClient {
    private static final String BASE_URL = "https://us-central1-inapppay-47111.cloudfunctions.net";
    private static Retrofit retrofit = null;
    private static InAppApiService apiService = null;

    /**
     * Provides singleton access to the API service interface.
     */
    public static InAppApiService getApiService() {
        if (apiService == null) {
            apiService = getRetrofitInstance().create(InAppApiService.class);
        }
        return apiService;
    }

    /**
     * Builds and returns a configured Retrofit instance.
     */
    private static Retrofit getRetrofitInstance() {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY); // Log request/response bodies

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(logging)
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}
