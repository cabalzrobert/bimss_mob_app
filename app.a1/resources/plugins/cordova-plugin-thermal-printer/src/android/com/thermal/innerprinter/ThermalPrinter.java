package com.thermal.innerprinter;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;

import com.iposprinter.iposprinterservice.*;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ComponentName;
import android.content.ServiceConnection;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import android.os.IBinder;

import android.util.Base64;
import android.util.Log;

import com.thermal.utils.BitmapUtils;
import com.thermal.innerprinter.ThreadPoolManager;

public class ThermalPrinter extends CordovaPlugin {
  private static final String TAG = "thermalPrinter";

  private BitmapUtils bitMapUtils;
  public IPosPrinterService posPrinterService; //private IWoyouService woyouService;
  //private PrinterStatusReceiver printerStatusReceiver = new PrinterStatusReceiver();
  //public IPosPrinterCallback posPrinterCallback = null;
  private ServiceConnection connService = new ServiceConnection() {
    @Override
    public void onServiceDisconnected(ComponentName name) {
      posPrinterService = null;
      Log.d(TAG, "Service disconnected");
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
      posPrinterService = IPosPrinterService.Stub.asInterface(service); //IWoyouService.Stub.asInterface(service);
      Log.d(TAG, "Service connected");
    }
  };

  /*public final static String OUT_OF_PAPER_ACTION = "woyou.aidlservice.jiuv5.OUT_OF_PAPER_ACTION";
  public final static String ERROR_ACTION = "woyou.aidlservice.jiuv5.ERROR_ACTION";
  public final static String NORMAL_ACTION = "woyou.aidlservice.jiuv5.NORMAL_ACTION";
  public final static String COVER_OPEN_ACTION = "woyou.aidlservice.jiuv5.COVER_OPEN_ACTION";
  public final static String COVER_ERROR_ACTION = "woyou.aidlservice.jiuv5.COVER_ERROR_ACTION";
  public final static String KNIFE_ERROR_1_ACTION = "woyou.aidlservice.jiuv5.KNIFE_ERROR_ACTION_1";
  public final static String KNIFE_ERROR_2_ACTION = "woyou.aidlservice.jiuv5.KNIFE_ERROR_ACTION_2";
  public final static String OVER_HEATING_ACITON = "woyou.aidlservice.jiuv5.OVER_HEATING_ACITON";
  public final static String FIRMWARE_UPDATING_ACITON = "woyou.aidlservice.jiuv5.FIRMWARE_UPDATING_ACITON";*/

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);

    Context applicationContext = this.cordova.getActivity().getApplicationContext();

    bitMapUtils = new BitmapUtils(applicationContext);

    Intent intent = new Intent();
    intent.setPackage("com.iposprinter.iposprinterservice"); //woyou.aidlservice.jiuiv5
    intent.setAction("com.iposprinter.iposprinterservice.IPosPrintService"); //woyou.aidlservice.jiuiv5.IWoyouService

    applicationContext.startService(intent);
    applicationContext.bindService(intent, connService, Context.BIND_AUTO_CREATE);

    /*IntentFilter mFilter = new IntentFilter();
    mFilter.addAction(OUT_OF_PAPER_ACTION);
    mFilter.addAction(ERROR_ACTION);
    mFilter.addAction(NORMAL_ACTION);
    mFilter.addAction(COVER_OPEN_ACTION);
    mFilter.addAction(COVER_ERROR_ACTION);
    mFilter.addAction(KNIFE_ERROR_1_ACTION);
    mFilter.addAction(KNIFE_ERROR_2_ACTION);
    mFilter.addAction(OVER_HEATING_ACITON);
    mFilter.addAction(FIRMWARE_UPDATING_ACITON);

    applicationContext.registerReceiver(printerStatusReceiver, mFilter);*/
  }

  @Override
  public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
    if (action.equals("printerInit")) {
      printerInit(callbackContext);
      return true;
    } else if (action.equals("hasPrinter")) {
      hasPrinter(callbackContext);
      return true;
    }
    //
    else if (action.equals("printTextWithFont")) { 
      printTextWithFont(data.getString(0), data.getString(1), (float) data.getDouble(2), callbackContext);
      return true;
    } else if (action.equals("printTextAlignWithFont")) { 
      printTextAlignWithFont(data.getString(0), data.getString(1), (float) data.getDouble(2), (float) data.getDouble(3), callbackContext);
      return true;
    } else if (action.equals("printColumnsText")) {
      printColumnsText(data.getJSONArray(0), data.getJSONArray(1), data.getJSONArray(2), data.getInt(3), callbackContext);
      return true;
    }
    //
    else if (action.equals("printBitmap")) { 
      printBitmap(data.getString(0), data.getInt(1), data.getInt(2), data.getBoolean(3), callbackContext);
      return true;
    } else if (action.equals("printBarCode")) { 
      printBarCode(data.getString(0), data.getInt(1), data.getInt(2), data.getInt(3), data.getInt(4), callbackContext);
      return true;
    } else if (action.equals("printQRCode")) { 
      printQRCode(data.getString(0), data.getInt(1), data.getInt(2), callbackContext);
      return true;
    } else if (action.equals("printText")) {  
      printText(data.getString(0), callbackContext);
      return true;
    }
    //
    else if (action.equals("setDepth")) {   
      setDepth(data.getInt(0), callbackContext);
      return true;
    } else if (action.equals("setAlignment")) {   
      setAlignment(data.getInt(0), callbackContext);
      return true;
    } else if (action.equals("setFontName")) { 
      setFontName(data.getString(0), callbackContext);
      return true;
    } else if (action.equals("setFontSize")) { 
      setFontSize((float) data.getDouble(0), callbackContext);
      return true;
    } 
    //
    else if (action.equals("printerFeedLines")) {  
      printerFeedLines(data.getInt(0), callbackContext);
      return true;
    }else if (action.equals("printBlankLines")) {  
      printBlankLines(data.getInt(0), data.getInt(1), callbackContext);
      return true;
    }
    //  
    else if (action.equals("printRawData")) {  
      printRawData(data.getString(0), callbackContext);
      return true;
    }else if (action.equals("sendUserCMDData")) {  
      sendUserCMDData(data.getString(0), callbackContext);
      return true;
    } 
    //
    else if (action.equals("performPrint")) {  
      performPrint(data.getInt(0), callbackContext);
      return true;
    } 
    return false;
  }

  private void runOnUiThread(Runnable runnable){
    //cordova.getThreadPool().execute(runnable);
    ThreadPoolManager.getInstance().executeTask(runnable);
  }
  
  public void printerInit(final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printerInit(new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }
 
            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }
          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  public void hasPrinter(final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          callbackContext.success(hasPrinter());
        } catch (Exception e) {
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  private int hasPrinter() {
    final IPosPrinterService printerService = posPrinterService;
    final boolean hasPrinterService = printerService != null;
    return hasPrinterService ? 1 : 0;
  }
  public void printRawData(String base64EncriptedData, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final byte[] d = Base64.decode(base64EncriptedData, Base64.DEFAULT);
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printRawData(d, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  public void sendUserCMDData(String base64EncriptedData, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final byte[] d = Base64.decode(base64EncriptedData, Base64.DEFAULT);
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.sendUserCMDData(d, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  //
  public void setDepth(int depth, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final int d = depth;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.setPrinterPrintDepth(d, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  public void setAlignment(int alignment, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final int align = alignment;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.setPrinterPrintAlignment(align, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  public void setFontName(String typeface, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final String tf = typeface;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.setPrinterPrintFontType(tf, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  public void setFontSize(float fontsize, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final float fs = fontsize;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.setPrinterPrintFontSize((int)fs, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  //
  public void printerFeedLines(int lines, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final int l = lines;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printerFeedLines(l, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  public void printBlankLines(int lines, int height, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final int l = lines;
    final int h = height;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printBlankLines(l, h, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  //
  public void printTextWithFont(String text, String typeface, float fontsize, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final String txt = text;
    final String tf = typeface;
    final float fs = fontsize;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printSpecifiedTypeText(txt, tf, (int)fs, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  public void printTextAlignWithFont(String text, String typeface, float fontsize, float alignment, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final String txt = text;
    final String tf = typeface;
    final float fs = fontsize;
    final float align = alignment;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.PrintSpecFormatText(txt, tf, (int)fs, (int)align, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  public void printColumnsText(JSONArray colsTextArr, JSONArray colsWidthArr, JSONArray colsAlign, int isContinuousPrint,
      final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final String[] clst = new String[colsTextArr.length()];
    for (int i = 0; i < colsTextArr.length(); i++) {
      try {
        clst[i] = colsTextArr.getString(i);
      } catch (JSONException e) {
        clst[i] = "-";
        Log.i(TAG, "ERROR TEXT: " + e.getMessage());
      }
    }
    final int[] clsw = new int[colsWidthArr.length()];
    for (int i = 0; i < colsWidthArr.length(); i++) {
      try {
        clsw[i] = colsWidthArr.getInt(i);
      } catch (JSONException e) {
        clsw[i] = 1;
        Log.i(TAG, "ERROR WIDTH: " + e.getMessage());
      }
    }
    final int[] clsa = new int[colsAlign.length()];
    for (int i = 0; i < colsAlign.length(); i++) {
      try {
        clsa[i] = colsAlign.getInt(i);
      } catch (JSONException e) {
        clsa[i] = 0;
        Log.i(TAG, "ERROR ALIGN: " + e.getMessage());
      }
    }
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printColumnsText(clst, clsw, clsa, isContinuousPrint, new IPosPrinterCallback.Stub() {  // 0?
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
  //
  public void printBitmap(String data, int width, int height, boolean isScaled, final CallbackContext callbackContext) {
    try {
      final IPosPrinterService printerService = posPrinterService;
      byte[] decoded = Base64.decode(data, Base64.DEFAULT);
      final Bitmap bitMap = (!isScaled?BitmapFactory.decodeByteArray(decoded, 0, decoded.length)
                                    :bitMapUtils.decodeBitmap(decoded, width, height));
      runOnUiThread(new Runnable() {
        @Override
        public void run() {
          try {
            printerService.printBitmap(width, height, bitMap, new IPosPrinterCallback.Stub() {
              @Override
              public void onRunResult(boolean isSuccess) {
                if (isSuccess) {
                  callbackContext.success("");
                } else {
                  callbackContext.error(isSuccess + "");
                }
              }

              @Override
              public void onReturnString(String result) {
                callbackContext.success(result);
              }

            });
          } catch (Exception e) {
            e.printStackTrace();
            Log.i(TAG, "ERROR: " + e.getMessage());
            callbackContext.error(e.getMessage());
          }
        }
      });
    } catch (Exception e) {
      e.printStackTrace();
      Log.i(TAG, "ERROR: " + e.getMessage());
    }
  }

  public void printBarCode(String data, int symbology, int width, int height, int textPosition,
      final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final String d = data;
    final int s = symbology;
    final int h = height;
    final int w = width;
    final int tp = textPosition;

    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printBarCode(d, s, h, w, tp, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }

          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  public void printQRCode(String data, int moduleSize, int errorLevel, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final String d = data;
    final int size = moduleSize;
    final int level = errorLevel;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printQRCode(d, size, level, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }
          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  public void printText(String message, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final String msgs = message;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printText(msgs, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }
          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  public void performPrint(int feedlines, final CallbackContext callbackContext) {
    final IPosPrinterService printerService = posPrinterService;
    final int fl = feedlines;
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          printerService.printerPerformPrint(fl, new IPosPrinterCallback.Stub() {
            @Override
            public void onRunResult(boolean isSuccess) {
              if (isSuccess) {
                callbackContext.success("");
              } else {
                callbackContext.error(isSuccess + "");
              }
            }

            @Override
            public void onReturnString(String result) {
              callbackContext.success(result);
            }
          });
        } catch (Exception e) {
          e.printStackTrace();
          Log.i(TAG, "ERROR: " + e.getMessage());
          callbackContext.error(e.getMessage());
        }
      }
    });
  }
}
