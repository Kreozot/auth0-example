import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View, Button, Linking } from 'react-native';
import jwtDecoder from 'jwt-decode';

const callbackURLScheme = 'ExpoAuth0Example://';
let redirectUri;
if (Expo.Constants.manifest.xde) {
  // Hi there, dear reader!
  // This value needs to be the tunnel url for your local Expo project.
  // It also needs to be listed in valid callback urls of your Auth0 Client
  // Settings. See the README for more information.
  redirectUri = 'exp://uq-gjy.charlesvinette.auth0-example.exp.direct/+/redirect';
} else {
  redirectUri = `${Expo.Constants.linkingUri}/redirect`;
}

const auth0ClientId = 'pdnNOE8axmLRPk6opnr6pSbIxmFJxAlA';
const auth0Domain = 'https://charlesvinette.auth0.com';

class App extends React.Component {
  state = {
    username: undefined,
  };
  componentDidMount() {
    Linking.addEventListener('url', this._handleAuth0Redirect);
  }

  _loginWithAuth0 = async () => {
    const redirectionURL =
      `${auth0Domain}/authorize` +
      this._toQueryString({
        client_id: auth0ClientId,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri: redirectUri,
        state: redirectUri,
      });
    const result = await Expo.WebBrowser.openBrowserAsync(redirectionURL, {
      callbackURLScheme,
    });
    this._handleAuth0Redirect(result.url);
  };

  _loginWithAuth0Twitter = async () => {
    const redirectionURL =
      `${auth0Domain}/authorize` +
      this._toQueryString({
        client_id: auth0ClientId,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri: redirectUri,
        connection: 'twitter',
        state: redirectUri,
      });
    const result = await Expo.WebBrowser.openBrowserAsync(redirectionURL, {
      callbackURLScheme: redirectUri,
    });
    this._handleAuth0Redirect(result.url);
  };

  _handleAuth0Redirect = async callbackURL => {
    const [, queryString] = callbackURL.split('#');
    const responseObj = queryString.split('&').reduce((map, pair) => {
      const [key, value] = pair.split('=');
      map[key] = value; // eslint-disable-line
      return map;
    }, {});
    const encodedToken = responseObj.id_token;
    const decodedToken = jwtDecoder(encodedToken);
    const username = decodedToken.name;
    this.setState({ username });
  };

  /**
   * Converts an object to a query string.
   */
  _toQueryString(params) {
    return (
      '?' +
      Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.username !== undefined
          ? <Text style={styles.title}>
              Hi {this.state.username}!
            </Text>
          : <View>
              <Text style={styles.title}>Example: Auth0 login</Text>
              <Button title="Login with Auth0" onPress={this._loginWithAuth0} />
              <Text style={styles.title}>Example: Auth0 force Twitter</Text>
              <Button title="Login with Auth0-Twitter" onPress={this._loginWithAuth0Twitter} />
              <Text style={styles.title}>Example: Open Google.com</Text>
              <Button
                title="Open Google"
                onPress={() => Expo.WebBrowser.openBrowserAsync('https://google.com', {})}
              />
            </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
});

Expo.registerRootComponent(App);
