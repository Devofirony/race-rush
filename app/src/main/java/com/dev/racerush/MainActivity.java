package com.dev.racerush;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
public class MainActivity extends Activity {
  WebView w;
  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
    getWindow().getDecorView().setBackgroundColor(Color.rgb(13, 9, 24));
    w = new WebView(this);
    w.setBackgroundColor(Color.rgb(13, 9, 24));
    w.setOverScrollMode(View.OVER_SCROLL_NEVER);
    WebSettings s = w.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    w.loadUrl("file:///android_asset/index.html");
    setContentView(w);
    immersive();
  }
  void immersive() {
    getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
      | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
  }
  @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) immersive(); }
  @Override protected void onPause() { super.onPause(); w.evaluateJavascript("pauseGame()", null); w.onPause(); }
  @Override protected void onResume() { super.onResume(); w.onResume(); }
  @Override public void onBackPressed() {
    w.evaluateJavascript("back()", v -> { if (!"true".equals(v)) finish(); });
  }
}
