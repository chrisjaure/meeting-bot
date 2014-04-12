#include <pebble.h>

static Window *window;
static TextLayer *text_layer;
static char action[5];
static int is_in_meeting = 0;

enum {
  QUOTE_KEY_ACTION = 0x0,
};

char *translate_error(AppMessageResult result) {
  switch (result) {
    case APP_MSG_OK: return "APP_MSG_OK";
    case APP_MSG_SEND_TIMEOUT: return "APP_MSG_SEND_TIMEOUT";
    case APP_MSG_SEND_REJECTED: return "APP_MSG_SEND_REJECTED";
    case APP_MSG_NOT_CONNECTED: return "APP_MSG_NOT_CONNECTED";
    case APP_MSG_APP_NOT_RUNNING: return "APP_MSG_APP_NOT_RUNNING";
    case APP_MSG_INVALID_ARGS: return "APP_MSG_INVALID_ARGS";
    case APP_MSG_BUSY: return "APP_MSG_BUSY";
    case APP_MSG_BUFFER_OVERFLOW: return "APP_MSG_BUFFER_OVERFLOW";
    case APP_MSG_ALREADY_RELEASED: return "APP_MSG_ALREADY_RELEASED";
    case APP_MSG_CALLBACK_ALREADY_REGISTERED: return "APP_MSG_CALLBACK_ALREADY_REGISTERED";
    case APP_MSG_CALLBACK_NOT_REGISTERED: return "APP_MSG_CALLBACK_NOT_REGISTERED";
    case APP_MSG_OUT_OF_MEMORY: return "APP_MSG_OUT_OF_MEMORY";
    case APP_MSG_CLOSED: return "APP_MSG_CLOSED";
    case APP_MSG_INTERNAL_ERROR: return "APP_MSG_INTERNAL_ERROR";
    default: return "UNKNOWN ERROR";
  }
}

static void send_msg(char *action) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, action);
  Tuplet action_tuple = TupletCString(QUOTE_KEY_ACTION, action);

  DictionaryIterator *iter;
  AppMessageResult result = app_message_outbox_begin(&iter);
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Outbox status: %s", translate_error(result));

  if (iter == NULL) {
    return;
  }

  dict_write_tuplet(iter, &action_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  text_layer_set_text(text_layer, "Select");
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_msg("start");
  text_layer_set_text(text_layer, "In a meeting");
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_msg("stop");
  text_layer_set_text(text_layer, "Not in a meeting");
}

static void click_config_provider(void *context) {
  // window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

void out_sent_handler(DictionaryIterator *sent, void *context) {
   APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message delivered!");
}


void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Failed to Send!");
}


void in_received_handler(DictionaryIterator *received, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message received!");
}


void in_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Dropped!");
}

static void app_message_init(void) {
  // Register message handlers
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_failed(out_failed_handler);
  app_message_register_outbox_sent(out_sent_handler);
  // Init buffers
  app_message_open(64, 16);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  text_layer = text_layer_create((GRect) { .origin = { 0, 72 }, .size = { bounds.size.w, 20 } });
  text_layer_set_text(text_layer, "Not in a meeting");
  text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(text_layer);
}

static void init(void) {
  window = window_create();
  app_message_init();
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
