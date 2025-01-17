import React, {useCallback} from 'react'
import {Clipboard} from 'react-native'
import {Button, Text} from 'react-native-paper'
import {useSelector} from 'react-redux'
import {Padding, QRCode} from 'src/components/atoms'
import {accountSelector} from 'src/redux/module/account'
import {entityType} from 'src/redux/module/entity'
import {uiHook} from 'src/redux/module/ui'
import styled from 'styled-components/native'

export function Receive() {
  const currentAccount = useSelector(
    accountSelector.getCurrentAccount,
  ) as entityType.IAccount
  const {notifyAddressCopied} = uiHook.useSnackbarManager()

  const onPressCopy = useCallback(() => {
    Clipboard.setString(currentAccount.address)
    notifyAddressCopied()
  }, [currentAccount.address, notifyAddressCopied])

  return (
    <Container>
      <Padding>
        <QRCode value={currentAccount.address} size={300} />
      </Padding>

      <Padding>
        <Text>{currentAccount.address}</Text>
      </Padding>

      <Button icon='assignment' mode='outlined' onPress={onPressCopy}>
        copy to clipboard
      </Button>
    </Container>
  )
}

const Container = styled.View`
  flex: 1;
  align-items: center;
  padding-top: 100;
`
