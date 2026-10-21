package com.dev.racerush;
import android.app.Activity;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
public class MainActivity extends Activity {
  WebView w;
  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
    w = new WebView(this);
    WebSettings s = w.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    w.loadUrl("file:///android_asset/index.html");
    setContentView(w);
  }
  @Override protected void onPause() { super.onPause(); w.evaluateJavascript("pauseGame()", null); w.onPause(); }
  @Override protected void onResume() { super.onResume(); w.onResume(); }
  @Override public void onBackPressed() {
    w.evaluateJavascript("back()", v -> { if (!"true".equals(v)) finish(); });
  }
}
