Attribute VB_Name = "KaeritenFormatter"
' ====================================================
' 漢文返り点自動整形マクロ
' KBR Editor 用 Word マクロテンプレート
' ====================================================
'
' このマクロは {KAI:レ} 形式のトークンを検索し、
' 返り点として適切に整形します。
'
' 使用方法:
'   1. Word で .dotm テンプレートを開く
'   2. Alt+F11 で VBA エディタを開く
'   3. 新しいモジュールを挿入し、このコードを貼り付け
'   4. .dotm として保存
'   5. KBR Editor から出力した .docx を開くと自動整形される
' ====================================================

' === パラメータ（必要に応じて調整） ===
Const KAI_FONT_SIZE As Single = 8        ' pt（返り点のフォントサイズ）
Const KAI_SCALING As Integer = 60        ' %（文字の縮尺）
Const KAI_POSITION As Single = -1.8      ' pt（ベースライン移動：負で下方向）
Const KAI_SPACING As Single = -0.3       ' pt（文字間隔：負で詰める）
Const KAI_FONT_NAME As String = "游明朝" ' フォント固定

' 調整の指針:
' - 位置が高い → KAI_POSITION を -2.0 〜 -2.2 へ
' - 位置が低い → KAI_POSITION を -1.5 〜 -1.6 へ
' - 大きい/小さい → KAI_SCALING を 55〜70 で調整
' - 離れすぎ → KAI_SPACING を -0.4、重なる → -0.2

' ====================================================
' メイン整形関数
' ====================================================
Sub FormatKaeritenV3()
    Dim story As Range
    Dim rng As Range
    Dim s As String

    ' すべてのストーリー（本文、ヘッダー、フッターなど）を処理
    For Each story In ActiveDocument.StoryRanges
        Set rng = story.Duplicate

        With rng.Find
            .ClearFormatting
            .Text = "{KAI:*}"
            .MatchWildcards = True
            .Forward = True
            .Wrap = wdFindStop

            ' {KAI:} トークンを順次検索・整形
            Do While .Execute
                ' トークン内容を取得（例: {KAI:レ} → レ）
                s = rng.Text
                s = Replace$(s, "{KAI:", "")
                s = Replace$(s, "}", "")

                ' トークンをテキストに置換
                rng.Text = s

                ' フォント整形を適用
                With rng.Font
                    .NameFarEast = KAI_FONT_NAME
                    .Size = KAI_FONT_SIZE
                    .Scaling = KAI_SCALING
                    .Position = KAI_POSITION
                    .Spacing = KAI_SPACING
                    .Superscript = False
                    .Subscript = False
                    .Color = wdColorRed  ' 赤色
                End With

                ' 次の検索位置へ移動
                rng.Collapse wdCollapseEnd
            Loop
        End With

        ' 次のストーリーがあれば継続
        If story.StoryType <> wdMainTextStory Then
            While Not (story.NextStoryRange Is Nothing)
                Set story = story.NextStoryRange
                Set rng = story.Duplicate
                ' 同じ処理を繰り返す...
            Wend
        End If
    Next story

    MsgBox "返り点の整形が完了しました。", vbInformation, "KBR Editor"
End Sub

' ====================================================
' 自動実行（文書を開いた時に実行される）
' ====================================================
Sub AutoOpen()
    On Error Resume Next
    Application.ScreenUpdating = False

    ' 整形を実行
    Call FormatKaeritenV3

    Application.ScreenUpdating = True
End Sub

' ====================================================
' 追加機能: 二段重ね返り点の微調整（オプション）
' ====================================================
' 例: {KAI:レ}{KAI:一} のように連続している場合、
' 2個目を少し上にずらすなど、必要に応じて実装
'
' Sub FormatDoubleKaeriten()
'     ' パターン検索: {KAI:?}{KAI:?}
'     ' 2個目の KAI_POSITION を -1.4 にする等
' End Sub

' ====================================================
' デバッグ用: 手動実行
' ====================================================
' Alt+F8 で「FormatKaeritenV3」を選択して実行可能
