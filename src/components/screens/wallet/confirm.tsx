import BN from 'bignumber.js'
import * as React from 'react'
import {Alert} from 'react-native'
import {Navigation} from 'react-native-navigation'
import {Button, Text} from 'react-native-paper'
import TouchID from 'react-native-touch-id'
import Ionicons from 'react-native-vector-icons/Ionicons'
import {useMappedState} from 'redux-react-hook'
import {Blockie} from 'src/components/atoms'
import {BiometryType, Size} from 'src/const'
import {useWeb3} from 'src/hooks'
import {IState} from 'src/redux/module'
import {
  accountHook,
  accountSelector,
  accountType,
} from 'src/redux/module/account'
import {entityType} from 'src/redux/module/entity'
import {settingSelector} from 'src/redux/module/setting'
import {walletHelper as wHelper} from 'src/utils'
import styled from 'styled-components/native'

export interface IProps {
  componentId: string
  txParams: accountType.ITransactionParams
}

export const Confirm = ({componentId, txParams}: IProps) => {
  const web3 = useWeb3()
  const mapState = React.useCallback(
    (state: IState) => ({
      currencyDetails: settingSelector.getCurrencyDetails(state),
      currentAccount: accountSelector.getCurrentAccount(
        state,
      ) as entityType.IAccount,
      fiatRate: accountSelector.getFiatRate(state),
    }),
    [],
  )
  const {currencyDetails, currentAccount, fiatRate} = useMappedState(mapState)
  const signAndSendTx = accountHook.useSignAndSendTransaction()

  const onPressSend = async () => {
    try {
      const biometryType = await TouchID.isSupported()
      if (
        // @ts-ignore
        ![BiometryType.FACE_ID, BiometryType.TOUCH_ID].includes(biometryType)
      ) {
        throw new Error('TouchID/FaceID does not supported')
      }
      await TouchID.authenticate('')
      await signAndSendTx(currentAccount, txParams)
      await Navigation.popToRoot(componentId)
      Alert.alert('Transaction has been successfully broadcasted!')
    } catch (error) {
      if (error.name === 'LAErrorUserCancel') {
        Alert.alert('Whoops!', 'Authentication failed. Try again!')
      } else {
        Alert.alert('Whoops!', error.message)
      }
    }
  }

  const ether = React.useMemo(
    () => web3.utils.fromWei(txParams.value, 'ether'),
    [txParams.value, web3.utils],
  )

  const maxGas = React.useMemo(
    () => new BN(txParams.gasLimit).multipliedBy(txParams.gasLimit),
    [txParams],
  )

  const maxTotal = React.useMemo(
    () =>
      web3.utils.fromWei(
        new BN(txParams.value).plus(maxGas).toString(),
        'ether',
      ),
    [maxGas, txParams.value, web3.utils],
  )

  const fiat = React.useMemo(
    () =>
      new BN(fiatRate)
        .multipliedBy(ether)
        .toFormat(currencyDetails.decimalDigits),
    [currencyDetails, ether, fiatRate],
  )

  return (
    <Container>
      <Header>
        <Title>
          <Text>Send Transaction</Text>
        </Title>

        <FromTo>
          <AccountInfo>
            <Blockie address={currentAccount.address} />
            <Text>{wHelper.omitAddress(currentAccount.address)}</Text>
          </AccountInfo>

          <Relation>
            <Text>{ether} ETH</Text>
            <Text>
              {fiat} {currencyDetails.code}
            </Text>
            <Ionicons name='ios-arrow-round-forward' size={24} />
          </Relation>

          <AccountInfo>
            <Blockie address={txParams.to} />
            <Text>{wHelper.omitAddress(txParams.to)}</Text>
          </AccountInfo>
        </FromTo>
      </Header>

      <Detail>
        <DetailItem>
          <Text>Gas Price</Text>
          <Text>{web3.utils.fromWei(txParams.gasPrice, 'Gwei')} GWEI</Text>
        </DetailItem>

        <DetailItem>
          <Text>Gas Limit</Text>
          <Text>{txParams.gasLimit} UNITS</Text>
        </DetailItem>

        <DetailItem>
          <Text>Max Transaction Fee</Text>
          <Text>{web3.utils.fromWei(maxGas.toString(), 'ether')} ETH</Text>
        </DetailItem>

        <DetailItem>
          <Text>Max Total</Text>
          <Text>{maxTotal} ETH</Text>
        </DetailItem>
      </Detail>

      <Button mode='contained' onPress={onPressSend}>
        send
      </Button>
    </Container>
  )
}

const Container = styled.View`
  flex: 1;
  padding-horizontal: ${Size.MARGIN_16};
`

const Header = styled.View`
  align-items: center;
  padding: 10px;
`

const Title = styled.View`
  padding: 20px 0;
`

const FromTo = styled.View`
  flex-direction: row;
`

const AccountInfo = styled.View`
  align-items: center;
`

const Relation = styled.View`
  align-items: center;
  justify-content: center;
`

const Detail = styled.View`
  padding: 10px;
`

const DetailItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0;
`
