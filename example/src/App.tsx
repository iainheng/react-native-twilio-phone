import React from 'react';
import {
  ActivityIndicator,
  Button,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import {
  EventType,
  RNTwilioPhone,
  twilioPhoneEmitter,
} from 'react-native-twilio-phone';

const identity = Platform.select({
  ios: 'Steve',
  android: 'Larry',
});

const from = Platform.select({
  ios: 'client:Steve',
  android: 'client:Larry',
});

const callKeepOptions = {
  ios: {
    appName: 'TwilioPhone Example',
    supportsVideo: false,
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'OK',
    additionalPermissions: [],
    // Required to get audio in background when using Android 11
    foregroundService: {
      channelId: 'com.example.reactnativetwiliophone',
      channelName: 'Foreground service for my app',
      notificationTitle: 'My app is running on background',
    },
  },
};

async function fetchAccessToken() {
  const identity = 'iainheng';

  // const response = await fetch(
  //   'https://ranqzcdrmbjot.a.pinggy.io/accessToken?identity=' +
  //     identity +
  //     '&os=' +
  //     Platform.OS
  // );
  // const accessToken = await response.text();

  // console.log(`Access token(${identity}): ${accessToken}`);
  console.log(identity);
  const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2YwOTY1Y2ZmYzc1YWMzMDlhYTc4NGVhZmUzYTljNDY3LTE2ODg0ODE3MjAiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJmaW9ubGF3Iiwidm9pY2UiOnsiaW5jb21pbmciOnsiYWxsb3ciOnRydWV9LCJvdXRnb2luZyI6eyJhcHBsaWNhdGlvbl9zaWQiOiJBUGNjZjI3MDQ3YmYwYjkzNGI1ZmY3NzYzMjQyNGJkOTFiIn0sInB1c2hfY3JlZGVudGlhbF9zaWQiOiJDUmIzYzNjNDVmMGUxMjA1NzczOGVhOTA5MWU2YTk4NjY5In19LCJpYXQiOjE2ODg0ODE3MjAsImV4cCI6MTY4ODQ4NTMyMCwiaXNzIjoiU0tmMDk2NWNmZmM3NWFjMzA5YWE3ODRlYWZlM2E5YzQ2NyIsInN1YiI6IkFDMTAxMDgzYjZhZGVmZmEzOWQ0NTc5ZWNjMDYwOThlNTcifQ.ILNK-YIyFbv6XS9ldakN5kC9rlRoCv3qim49myCnL6U';
  return accessToken;
}

export function App() {
  const [to, setTo] = React.useState('');
  const [callInProgress, setCallInProgress] = React.useState(false);
  const options = {
    requestPermissionsOnInit: true, // Default: true - Set to false if you want to request permissions manually
  };

  React.useEffect(() => {
    return RNTwilioPhone.initialize(callKeepOptions, fetchAccessToken, options);
  }, []);

  React.useEffect(() => {
    const subscriptions = [
      twilioPhoneEmitter.addListener(EventType.CallConnected, () => {
        setCallInProgress(true);
      }),
      twilioPhoneEmitter.addListener(EventType.CallDisconnected, () => {
        setCallInProgress(RNTwilioPhone.calls.length > 0);
      }),
      twilioPhoneEmitter.addListener(
        EventType.CallDisconnectedError,
        (data) => {
          console.log(data);
          setCallInProgress(RNTwilioPhone.calls.length > 0);
        }
      ),
    ];

    return () => {
      subscriptions.map((subscription) => {
        subscription.remove();
      });
    };
  }, []);

  function hangup() {
    RNCallKeep.endAllCalls();
  }

  async function call() {
    console.log('Pressed call.');

    if (to === '') {
      return;
    }

    setCallInProgress(true);

    try {
      console.log(to, 'to');
      await RNTwilioPhone.startCall(to, 'My friend', from);
    } catch (e) {
      console.log(e);
      setCallInProgress(false);
    }
  }

  async function unregister() {
    try {
      await RNTwilioPhone.unregister();
    } catch (e) {
      console.log(e);
    }
  }

  let content;

  if (callInProgress) {
    content = (
      <View>
        <ActivityIndicator color="#999" style={styles.loader} />
        <Button title="End call" onPress={hangup} />
      </View>
    );
  } else {
    content = (
      <View>
        <TextInput
          style={styles.to}
          onChangeText={(text) => setTo(text)}
          value={to}
          placeholder="Client or phone number"
          placeholderTextColor="gray"
        />
        <Button title="Start call" onPress={call} />
        <View style={styles.unregister}>
          <Button title="Unregister" onPress={unregister} />
        </View>
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginBottom: 40,
  },
  to: {
    height: 50,
    width: 200,
    fontSize: 16,
    borderColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 40,
    color: 'gray',
    textAlign: 'center',
  },
  unregister: {
    marginTop: 40,
  },
});
