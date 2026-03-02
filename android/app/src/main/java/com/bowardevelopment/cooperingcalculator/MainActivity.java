package com.bowardevelopment.cooperingcalculator;

import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;

public class MainActivity extends BridgeActivity {
    private AdView adView;
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "========== MainActivity onCreate ==========");

        // Initialize Google Mobile Ads SDK
        MobileAds.initialize(this, new OnInitializationCompleteListener() {
            @Override
            public void onInitializationComplete(InitializationStatus initializationStatus) {
                Log.d(TAG, "========== AdMob initialized ==========");
                Log.d(TAG, "Initialization status: " + initializationStatus.toString());
            }
        });

        // Add banner ad after a delay to ensure layout is ready
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.d(TAG, "========== Starting addBannerView ==========");
                addBannerView();
            }
        }, 500); // Wait 500ms for view hierarchy to be ready
    }

    private void addBannerView() {
        try {
            Log.d(TAG, "addBannerView() called");

            // Safety check
            if (getBridge() == null) {
                Log.e(TAG, "========== ERROR: Bridge is null ==========");
                return;
            }
            Log.d(TAG, "Bridge is OK");

            if (getBridge().getWebView() == null) {
                Log.e(TAG, "========== ERROR: WebView is null ==========");
                return;
            }
            Log.d(TAG, "WebView is OK");

            // Create banner ad
            Log.d(TAG, "Creating AdView...");
            adView = new AdView(this);
            adView.setAdSize(AdSize.BANNER);
            Log.d(TAG, "AdView created");

            // Use test ad unit ID in debug, real ID in release
            // Check if we're in debug mode by looking for debuggable flag
            boolean isDebug = (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
            Log.d(TAG, "Debug mode: " + isDebug);

            if (isDebug) {
                adView.setAdUnitId("ca-app-pub-3940256099942544/6300978111"); // Google test banner
                Log.d(TAG, "========== Using TEST ad unit ID ==========");
            } else {
                adView.setAdUnitId("ca-app-pub-5844342294171768/9403492810"); // Your real banner
                Log.d(TAG, "========== Using PRODUCTION ad unit ID ==========");
            }

            // Set up ad listener for debugging
            Log.d(TAG, "Setting up ad listener...");
            adView.setAdListener(new com.google.android.gms.ads.AdListener() {
                @Override
                public void onAdLoaded() {
                    Log.w(TAG, "========== ✅ Banner ad loaded successfully ==========");
                }

                @Override
                public void onAdFailedToLoad(LoadAdError error) {
                    Log.e(TAG, "========== ❌ Banner ad failed to load ==========");
                    Log.e(TAG, "Error code: " + error.getCode());
                    Log.e(TAG, "Error message: " + error.getMessage());
                    Log.e(TAG, "Error domain: " + error.getDomain());
                }

                @Override
                public void onAdOpened() {
                    Log.d(TAG, "Banner ad opened");
                }

                @Override
                public void onAdClicked() {
                    Log.d(TAG, "Banner ad clicked");
                }

                @Override
                public void onAdClosed() {
                    Log.d(TAG, "Banner ad closed");
                }
            });
            Log.d(TAG, "Ad listener set up complete");

            // Get the root view - find the top-level view group
            Log.d(TAG, "Getting WebView parent...");
            View webViewParent = (View) getBridge().getWebView().getParent();
            Log.d(TAG, "WebView parent type: " + (webViewParent != null ? webViewParent.getClass().getSimpleName() : "null"));

            // Find the root ViewGroup by walking up the tree
            ViewGroup rootView = null;
            View current = webViewParent;
            while (current != null) {
                if (current instanceof ViewGroup) {
                    rootView = (ViewGroup) current;
                    if (current.getParent() == null || !(current.getParent() instanceof View)) {
                        break; // Found the root
                    }
                }
                current = (View) current.getParent();
            }

            if (rootView == null) {
                Log.e(TAG, "========== ERROR: Could not find root ViewGroup ==========");
                return;
            }
            Log.d(TAG, "Found root view: " + rootView.getClass().getSimpleName());

            // Create a container for the banner at the bottom
            Log.d(TAG, "Creating ad container...");
            FrameLayout adContainer = new FrameLayout(this);
            adContainer.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            Log.d(TAG, "Ad container created");

            // Add banner to container with bottom gravity
            Log.d(TAG, "Adding banner to container...");
            FrameLayout.LayoutParams bannerParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            bannerParams.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
            adView.setLayoutParams(bannerParams);
            adContainer.addView(adView);
            Log.d(TAG, "Banner added to container");

            // Add container to root view
            Log.d(TAG, "Adding container to root view...");
            ViewGroup.LayoutParams containerParams = new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            );
            rootView.addView(adContainer, containerParams);
            Log.d(TAG, "Container added to root view");

            // Add padding to web view to avoid overlap with banner
            int bannerHeightPx = (int) (50 * getResources().getDisplayMetrics().density);
            getBridge().getWebView().setPadding(0, 0, 0, bannerHeightPx);
            Log.d(TAG, "WebView padding set: " + bannerHeightPx + "px");

            // Load ad
            Log.d(TAG, "Creating ad request...");
            AdRequest adRequest = new AdRequest.Builder().build();
            Log.d(TAG, "Loading ad...");
            adView.loadAd(adRequest);

            Log.d(TAG, "========== Banner ad requested with unit ID: " + adView.getAdUnitId() + " ==========");

            // Add a timeout check to see if ad callbacks are being triggered
            new android.os.Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    Log.w(TAG, "========== 5 seconds passed - Ad should have loaded or failed by now ==========");
                }
            }, 5000);
        } catch (Exception e) {
            Log.e(TAG, "========== ERROR ADDING BANNER VIEW ==========");
            Log.e(TAG, "Exception: " + e.getClass().getName());
            Log.e(TAG, "Message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        if (adView != null) {
            adView.destroy();
        }
        super.onDestroy();
    }
}
