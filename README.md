CNI vpn client command line launcher
===

The tool starts the `openvpn` client and passes the authentication details. This
includes calculating the TOTP code and concatenating it with the password.

## Usage

Configuration values an either be set as environment variables or in the
.openvpn file in the home directory

Set the following variables:
- `OPENVPN_CONFIG_FILE` Path to a the OpenVPN configuration file to pass to the client
- `OPENVPN_USERNAME` Username used to authenticate with the VPN
- `OPENVPN_PASSWORD` Password used to authenticate with the VPN
- `OPENVPN_TOTP_SECRET` The secret used to generate the 2FA code that is
concatenated with the password.

### Example
```
OPENVPN_CONFIG_FILE=~/myconfig.ovpn
OPENVPN_USERNAME=user@example.com
OPENVPN_PASSWORD=mysecretpassword
OPENVPN_TOTP_SECRET=123456789abcdef
```

To start the vpn run `vpn` on the command line
