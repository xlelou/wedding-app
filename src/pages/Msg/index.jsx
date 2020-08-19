import Taro, {Component} from '@tarojs/taro'
import { Image, View } from '@tarojs/components';
import LoadMore from "../../components/LoadMore";
import SendMsg from "./components/SendMsg"
import GetUserInfo from '../../components/GetUserInfo';
import iconWrite from "../../common/img/icon-write.png";
import './index.scss'

import cloud from '../../service/cloud';

class Msg extends Component {
    state = {
        list: [],
        current: 0,
        loadingStatus: 'loading',
        isMore: true,
        msgVisible: false
    };

    componentWillMount() {
        this.getList();
    }
    config = {
        enablePullDownRefresh: true,
        navigationBarTitleText: '留言',
    };
    onShareAppMessage () {
        const {
            invite
        } = this.props;
        return {
            title: `诚邀您参加${invite.groomName}&${invite.brideName}的婚礼`,
            path: '/pages/Index/index',
        }
    }

    onPullDownRefresh () {
        this.setState({
            list: [],
            current: 0,
            loadingStatus: 'loading',
            isMore: true,
        }, () => {
            this.getList();
        });
    };
    onReachBottom () {
        this.getList();
    };

    getList = () => {
        const {
            isMore,
            current
        } = this.state;
        if (!isMore) {
            return false;
        }
        Taro.showNavigationBarLoading();
        cloud.get('wedding_msgs', current).then((res) => {
            if (res.errMsg === 'collection.get:ok') {
                if (res.data.length <= 0) {
                    this.setState({
                        isMore: false,
                        loadingStatus: 'noMore'
                    });
                } else {
                    this.setState({
                        list: [...this.state.list, ...res.data],
                        current: current + 1
                    });
                    if (res.data.length < 10) {
                        this.setState({
                            isMore: false,
                            loadingStatus: 'noMore'
                        });
                    }
                }
            }
            Taro.hideNavigationBarLoading();
            Taro.stopPullDownRefresh();
        }, (err) => {
            console.log(err);
            Taro.stopPullDownRefresh();
            Taro.hideNavigationBarLoading();
            this.setState({
                isMore: false,
                loadingStatus: 'noMore'
            });
            Taro.showToast({
                title: err.errMsg || '请求失败，请重试！',
                icon: 'none',
                duration: 3000
            });
        });
    };

    // 列表渲染
    renderList = () => {
        let {
            list
        } = this.state;
        return list.map((item) => {
            return (
                <View className='msg-item' key={Math.random() * Math.random()}>
                    <View className='msg-item__user-avatar'>
                        <Image className='msg-item__user-avatar-img' src={item.avatarUrl} />
                    </View>
                    <View className='msg-item__desc'>
                        <View className='msg-item__user-info'>
                            <View className='msg-item__user-name'>
                                {item.nickName}
                            </View>
                            <View className='msg-item__msg-time'>
                                {item.createTime}
                            </View>
                        </View>
                        <View className='msg-item__msg-text'>{item.userMsg}</View>
                    </View>
                </View>
            )
        });
    };

    render() {
        const {
            loadingStatus,
            msgVisible
        } = this.state;

        return (
            <View className='page msg'>
                <View className='msg-list'>
                    {
                        this.renderList()
                    }
                </View>
                <LoadMore loadingStatus={loadingStatus} />
                <View className='msg-send'>
                    <GetUserInfo onHandleComplete={() => {
                        this.setState({
                            msgVisible: true
                        })
                    }}
                    />
                    <Image src={iconWrite} className='msg-send-icon' />
                    <View className='msg-send-btn'>
                        写祝福
                    </View>
                </View>

                <SendMsg visible={msgVisible} onHandleCloseMsg={() => {
                    this.setState({
                        msgVisible: false
                    })
                }}
                />
            </View>
        )
    }
}

export default Msg

