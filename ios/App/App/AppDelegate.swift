import UIKit
import Capacitor
import GoogleMobileAds

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, BannerViewDelegate {

    var window: UIWindow?
    var bannerView: BannerView!

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialize Google Mobile Ads SDK
        MobileAds.shared.start { status in
            print("AdMob initialized")
        }

        // Add banner ad after a short delay to ensure window is ready
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.addBannerView()
        }

        return true
    }

    func addBannerView() {
        guard let window = window,
              let rootViewController = window.rootViewController else {
            print("ERROR: Window or root view controller not available")
            return
        }

        print("Creating banner view...")

        // Create banner view with real ad unit ID
        bannerView = BannerView(adSize: AdSizeBanner)
        bannerView.adUnitID = "ca-app-pub-5844342294171768/9281498456"
        bannerView.rootViewController = rootViewController
        bannerView.delegate = self

        // Position at bottom of screen
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        window.addSubview(bannerView)

        NSLayoutConstraint.activate([
            bannerView.bottomAnchor.constraint(equalTo: window.safeAreaLayoutGuide.bottomAnchor),
            bannerView.centerXAnchor.constraint(equalTo: window.centerXAnchor)
        ])

        // Add bottom padding to the web view to avoid overlap with banner
        // Standard banner height is 50 points
        let bannerHeight: CGFloat = 50
        rootViewController.additionalSafeAreaInsets = UIEdgeInsets(
            top: 0,
            left: 0,
            bottom: bannerHeight,
            right: 0
        )

        // Inject CSS to add bottom padding to the web content
        if let bridge = (rootViewController as? CAPBridgeViewController) {
            let css = """
                body, #app, .q-page-container {
                    padding-bottom: 60px !important;
                }
            """
            let js = """
                var style = document.createElement('style');
                style.innerHTML = '\(css)';
                document.head.appendChild(style);
            """
            bridge.webView?.evaluateJavaScript(js, completionHandler: nil)
        }

        // Load ad with non-personalized ads only
        print("Loading ad request...")
        let request = Request()
        let extras = Extras()
        extras.additionalParameters = ["npa": "1"]  // Request non-personalized ads
        request.register(extras)
        bannerView.load(request)
    }

    // MARK: - BannerViewDelegate

    func bannerViewDidReceiveAd(_ bannerView: BannerView) {
        print("✅ Banner ad loaded successfully!")
    }

    func bannerView(_ bannerView: BannerView, didFailToReceiveAdWithError error: Error) {
        print("❌ Banner ad failed to load with error: \(error.localizedDescription)")
    }

    func bannerViewWillPresentScreen(_ bannerView: BannerView) {
        print("Banner will present screen")
    }

    func bannerViewWillDismissScreen(_ bannerView: BannerView) {
        print("Banner will dismiss screen")
    }

    func bannerViewDidDismissScreen(_ bannerView: BannerView) {
        print("Banner did dismiss screen")
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
