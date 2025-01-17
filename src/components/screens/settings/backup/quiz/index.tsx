import React, {useCallback, useMemo} from 'react'
import {Alert, View} from 'react-native'
import {Navigation} from 'react-native-navigation'
import {Button, Subheading} from 'react-native-paper'
import {useSelector} from 'react-redux'
import shuffle from 'shuffle-array'
import {CenteredColumn, Padding} from 'src/components/atoms'
import {WordList} from 'src/components/organisms'
import {useWordListManager} from 'src/components/screens/settings/backup/quiz/hooks'
import {WordPool} from 'src/components/screens/settings/backup/quiz/word-pool'
import {ModalTemplate} from 'src/components/templates'
import {Size} from 'src/const'
import {accountHook, accountSelector} from 'src/redux/module/account'

interface IProps {
  componentId: string
  isModal?: boolean
}

export function Quiz({componentId, isModal = false}: IProps) {
  const mnemonic = useSelector(accountSelector.getMnemonic) as string
  const {setIsBackedUp} = accountHook.useAccountManager()

  const mnemonicList = useMemo(
    () => shuffle(mnemonic.split(' '), {copy: true}),
    [mnemonic],
  )

  const {
    clear,
    index,
    isEmpty,
    isFilled,
    isUsedFactory,
    move,
    remove,
    toggleFactory,
    wordList,
  } = useWordListManager()

  const onPressVerify = useCallback(() => {
    if (mnemonic === wordList.join(' ')) {
      Alert.alert(
        'Your wallet is backed up!',
        `Be sure to store your recovery phrase in \
a secure place. If this app is deleted, your money \
cannot be recovered without it.`,
        [
          {
            onPress: () => {
              setIsBackedUp(true)
              Navigation.popToRoot(componentId)
            },
            text: 'Got it',
          },
        ],
      )
    } else {
      Alert.alert(
        'Uh oh...',
        `it's important that you write your backup \
phrase down correctly. If something happens to your \
wallet, you'll need this backup to recovery you money. \
Please review your backup and try again. `,
        [{text: 'OK', onPress: clear}],
      )
    }
  }, [clear, componentId, mnemonic, setIsBackedUp, wordList])

  return (
    <ModalTemplate componentId={componentId} disabled={!isModal} text='cancel'>
      <View>
        <Padding verticalSize={Size.MARGIN_8}>
          <CenteredColumn>
            <Subheading>Let&apos;s verify your recovery phrase.</Subheading>
          </CenteredColumn>
        </Padding>

        <Padding verticalSize={Size.MARGIN_8}>
          <WordList
            words={wordList}
            index={index}
            onPressItem={move}
            remove={remove}
          />
        </Padding>

        {!isFilled ? (
          <Padding verticalSize={Size.MARGIN_8}>
            <WordPool
              isUsedFactory={isUsedFactory}
              mnemonicList={mnemonicList}
              toggleFactory={toggleFactory}
            />
          </Padding>
        ) : null}

        <Padding verticalSize={Size.MARGIN_8}>
          {isFilled ? (
            <Button mode='contained' onPress={onPressVerify}>
              verify
            </Button>
          ) : null}

          <Button disabled={isEmpty} mode='text' onPress={clear}>
            clear
          </Button>
        </Padding>
      </View>
    </ModalTemplate>
  )
}
